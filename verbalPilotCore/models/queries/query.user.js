const { pgQuery, pgPool } = require('../index');

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
    password, 
    phone, 
    gender, 
    dateOfBirth,
    token,
    jwtExpiry,
    deviceInfo,
    ipAddress
}) {
    const client = await pgPool.connect();
    
    try {
        await client.query('BEGIN');
        
        // 1. Create user
        const userQuery = `
            INSERT INTO users (first_name, last_name, email, password, phone, gender, date_of_birth)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const userResult = await client.query(userQuery, [firstName, lastName, email, password, phone, gender, dateOfBirth]);
        const user = userResult.rows[0];
        
        // 2. Create user_meta
        const metaQuery = `
            INSERT INTO user_meta (user_id, is_verified, is_deleted)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        await client.query(metaQuery, [user.id, false, false]);
        
        // 3. Create user token
        const tokenQuery = `
            INSERT INTO user_tokens (user_id, token, jwt_expiry, token_type, device_info, ip_address)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        await client.query(tokenQuery, [user.id, token, jwtExpiry, 'access', deviceInfo, ipAddress]);
        
        await client.query('COMMIT');
        return user;
        
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

async function validateUserToken(token, userId) {
    const query = `
        SELECT * FROM user_tokens 
        WHERE token = $1 AND user_id = $2 AND is_revoked = false
        LIMIT 1
    `;
    const { rows } = await pgQuery(query, [token, userId]);
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
    getUserForPasswordResetByEmail
}; 