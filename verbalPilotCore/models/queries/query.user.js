const { pgQuery, pgPool } = require('../index');
const { JWT_SECRET, JWT_EXPIRY, SALT_ROUNDS } = process.env;
const jwt = require('jsonwebtoken');

async function getUserProfileById(id) {
    const query = `
        SELECT u.id, u.email, u.gender, u.date_of_birth AS "dateOfBirth", u.first_name AS "firstName", u.last_name AS "lastName", 
               um.is_verified AS "isVerified", u.phone, u.created_at, u.updated_at
        FROM users u
        INNER JOIN user_meta um ON u.id = um.user_id
        WHERE u.id = $1 AND um.is_deleted = false
        LIMIT 1
    `;
    const { rows } = await pgQuery(query, [id]);
    return rows[0] || null;
}

async function getUserByEmail(email) {
    const query = `
        SELECT u.*, um.is_verified, um.is_deleted
        FROM users u
        INNER JOIN user_meta um ON u.id = um.user_id
        WHERE u.email = $1 AND um.is_deleted = false
        LIMIT 1
    `;
    const { rows } = await pgQuery(query, [email]);
    return rows[0] || null;
}

async function createUser({ firstName, lastName, email, password, phone, gender, dateOfBirth }) {
    const query = `
        INSERT INTO users (first_name, last_name, email, password, phone, gender, date_of_birth)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `;
    const { rows } = await pgQuery(query, [firstName, lastName, email, password, phone, gender, dateOfBirth]);
    return rows[0];
}

async function createUserWithMetaAndToken({
    firstName,
    lastName,
    email,
    password = null,
    phone = '999-999-9999',
    gender = 'other',
    dateOfBirth = '2000-01-01',
    jwtExpiry,
    deviceInfo = null,
    ipAddress = null,
    googleSubId = null,
    isVerified = false
}) {
    const client = await pgPool.connect();

    // You can make these dynamic if you like:
    const planId = 1; // your default or chosen plan
    const groupId = 1; // fixed as per your requirement

    try {
        await client.query('BEGIN');

        // 1. Create user
        const userQuery = `
            INSERT INTO users (first_name, last_name, email, password, phone, gender, date_of_birth)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const userResult = await client.query(userQuery, [
            firstName, lastName, email, password, phone, gender, dateOfBirth
        ]);
        const user = userResult.rows[0];

        const token = jwt.sign(
            {
                id: user.id,
                isVerified: isVerified,
                email
            },
            JWT_SECRET,
            {
                expiresIn: JWT_EXPIRY
            }
        );


        // 2. Create user_meta
        const metaQuery = `
            INSERT INTO user_meta (user_id, google_sub_id, is_verified, is_deleted)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        await client.query(metaQuery, [user.id, googleSubId, isVerified, false]);

        // 3. Create user token
        const tokenQuery = `
            INSERT INTO user_tokens (user_id, token, jwt_expiry, token_type, device_info, ip_address)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        await client.query(tokenQuery, [
            user.id,
            token,
            jwtExpiry,
            'access',
            deviceInfo,
            ipAddress
        ]);

        // 🔥 NEW STEP: create master subscription (360 days)
        const masterSubQuery = `
            INSERT INTO user_master_subscriptions
                (user_id, plan_id, start_date, end_date, status, created_at, updated_at)
            VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE + INTERVAL '360 days', 'ACTIVE', NOW(), NOW())
            RETURNING id
        `;
        const masterSubRes = await client.query(masterSubQuery, [user.id, planId]);
        const masterSubId = masterSubRes.rows[0].id;

        // 🔥 NEW STEP: create first 30-day cycle
        const cycleQuery = `
            INSERT INTO user_subscription_cycles
                (master_subscription_id, cycle_start, cycle_end, used_count, created_at, updated_at)
            VALUES ($1, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 0, NOW(), NOW())
            RETURNING id
        `;
        const cycleRes = await client.query(cycleQuery, [masterSubId]);
        const cycleId = cycleRes.rows[0].id;

        // 🔥 NEW STEP: create user_group_mapping with group_id = 1
        const mappingQuery = `
            INSERT INTO user_group_mapping
                (name, display_name, description, user_id, group_id, is_active, is_deleted, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, TRUE, FALSE, NOW(), NOW())
            RETURNING id
        `;
        const mappingName = `Group ${groupId} User ${user.id}`;
        const mappingDisplay = `Group ${groupId} User ${user.id}`;
        const mappingDesc = 'Auto-mapped group membership';
        const mappingRes = await client.query(mappingQuery, [
            mappingName,
            mappingDisplay,
            mappingDesc,
            user.id,
            groupId
        ]);
        const mappingId = mappingRes.rows[0].id;

        // Commit transaction
        await client.query('COMMIT');

        // Optionally return all inserted IDs
        return {
            user,
            token,
            masterSubscriptionId: masterSubId,
            cycleId,
            groupMappingId: mappingId
        };

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}


async function insertUserToken({ userId, token, jwtExpiry, tokenType, deviceInfo, ipAddress }) {
    const query = `
        INSERT INTO user_tokens (user_id, token, jwt_expiry, token_type, device_info, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `;
    const { rows } = await pgQuery(query, [userId, token, jwtExpiry, tokenType, deviceInfo, ipAddress]);
    return rows[0];
}

async function revokeUserTokens(userId, tokenType = 'access') {
    const query = `
        UPDATE user_tokens 
        SET is_revoked = true, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND token_type = $2 AND is_revoked = false
    `;
    await pgQuery(query, [userId, tokenType]);
}

async function validateUserToken(token, email) {
    const query = `
        SELECT * FROM user_tokens ut
        JOIN users u ON ut.user_id = u.id
        WHERE ut.token = $1 AND u.email = $2 AND is_revoked = false
        LIMIT 1
    `;
    const { rows } = await pgQuery(query, [token, email]);
    return rows[0] || null;
}

async function updateUserVerificationCode(userId, verificationCode) {
    const query = `
        UPDATE users 
        SET verification_code = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
    `;
    const { rows } = await pgQuery(query, [verificationCode, userId]);
    return rows[0];
}

async function createUserMeta({ userId, isVerified, isDeleted }) {
    const query = `
        INSERT INTO user_meta (user_id, is_verified, is_deleted)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const { rows } = await pgQuery(query, [userId, isVerified, isDeleted]);
    return rows[0];
}

async function updateUserData({
    userId,
    firstName,
    lastName,
    gender,
    dateOfBirth,
    phone
}) {
    const query = `
        UPDATE users
        SET
            first_name = $1,
            last_name = $2,
            gender = $3,
            date_of_birth = $4,
            phone = $5,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
    `;
    const { rows } = await pgQuery(query, [
        firstName,
        lastName,
        gender,
        dateOfBirth,
        phone,
        userId
    ]);
    return rows[0];
}

async function setUserVerified(userId) {
    // Assuming is_verified is in user_meta table
    const query = `
        UPDATE user_meta
        SET is_verified = true, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND is_deleted = false
        RETURNING *
    `;
    const { rows } = await pgQuery(query, [userId]);
    return rows[0];
}

async function getUserVerificationDataById(id) {
    const query = `
        SELECT u.id, u.email, u.verification_code AS "verificationCode", um.is_verified AS "isVerified"
        FROM users u
        INNER JOIN user_meta um ON u.id = um.user_id
        WHERE u.id = $1 AND um.is_deleted = false
        LIMIT 1
    `;
    const { rows } = await pgQuery(query, [id]);
    return rows[0] || null;
}

async function getUserForPasswordResetByEmail(email) {
    const query = `
        SELECT u.id, u.email, u.first_name AS "firstName", u.last_name AS "lastName"
        FROM users u
        INNER JOIN user_meta um ON u.id = um.user_id
        WHERE u.email = $1 AND um.is_deleted = false
        LIMIT 1
    `;
    const { rows } = await pgQuery(query, [email]);
    return rows[0] || null;
}

async function updateUserPasswordById(userId, hashedPassword) {
    const query = `
        UPDATE users
        SET password = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, email;
    `;
    const { rows } = await pgQuery(query, [hashedPassword, userId]);
    return rows[0] || null;
}

async function getUserPasswordById(userId) {
    const query = 'SELECT password FROM users WHERE id = $1';
    const { rows } = await pgQuery(query, [userId]);
    return rows[0]?.password || null;
}

async function getUserTokenByTokenAndUserId(token, userId) {
    const query = `SELECT * FROM user_tokens WHERE token = $1 AND user_id = $2 AND is_revoked = false LIMIT 1`;
    const { rows } = await pgQuery(query, [token, userId]);
    return rows[0] || null;
}

module.exports = {
    getUserProfileById,
    getUserByEmail,
    createUser,
    createUserWithMetaAndToken,
    insertUserToken,
    revokeUserTokens,
    validateUserToken,
    updateUserVerificationCode,
    createUserMeta,
    updateUserData,
    setUserVerified,
    getUserVerificationDataById,
    getUserForPasswordResetByEmail,
    updateUserPasswordById,
    getUserPasswordById,
    getUserTokenByTokenAndUserId
}; 