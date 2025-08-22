const { responseMessages, EMAIL_TEMPLATES } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');
const { googleClient } = require('../../../../utils/auth/googleAuth/client.googleAuth');
const { getUserByEmail, revokeUserTokens, insertUserToken, createUserWithMetaAndToken } = require('../../../../../models/queries/query.user');
const jwt = require('jsonwebtoken');
const { updateEmailVerification } = require('../../../../commonServices/users/sendEmailVerificationCode');
const { JWT_EXPIRY, JWT_SECRET } = process.env;

const signInUser = async (userData) => {

    const expirySeconds = parseInt(JWT_EXPIRY) || 86400; // Default to 24 hours if parsing fails

    // Generate JWT token
    const token = jwt.sign(
        {
            id: userData.id,
            email: userData.email,
            isVerified: userData.is_verified
        },
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRY,
        }
    );

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expirySeconds);

    // Revoke existing tokens for this user
    await revokeUserTokens(userData.id, 'access');

    // Insert new token
    await insertUserToken({
        userId: userData.id,
        token,
        jwtExpiry: expiryDate,
        tokenType: 'access',
    });

    logger.info('User authenticated successfully', {
        userId: userData.id,
        isVerified: userData.is_verified
    });

    logger.info('Login successful: Token created', {
        userId: userData.id
    });

    return {
        Error: false,
        message: responseMessages.SUCCESS_CONSTANTS.LOGIN_SUCCESSFUL,
        data: {
            token,
            userId: userData.id,
            userEmail: userData.email,
        }

    };

}

const signUpUser = async ({ firstName, lastName, email, googleSubId, isVerified }) => {
    const expirySeconds = parseInt(JWT_EXPIRY) || 86400;

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expirySeconds);
    console.log(
        `Creating user with firstName: ${firstName}, lastName: ${lastName}, email: ${email}, googleSubId: ${googleSubId}, isVerified: ${isVerified}`
    );
    // Create user, user_meta, and token in a single transaction
    const { user, token } = await createUserWithMetaAndToken({
        firstName,
        lastName,
        email,
        jwtExpiry: expiryDate,
        googleSubId,
        isVerified,
    });

    await updateEmailVerification(user, EMAIL_TEMPLATES.keys.SIGNUP, isVerified);

    return {
        Error: false,
        data: {
            token,
            userId: user.id,
            userEmail: user.email,
        }
    }

};

const handleGoogleAuthCallback = async ({ credential }) => {
    try {
        logger.info('Starting handleGoogleAuthCallback process');

        console.log(`Credential: ${credential}`);
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        console.log("Payload: ", payload);
        // name is full name, given_name is first name, email is user's email, sub is google's unique user id
        const { name, email, given_name, sub: googleSubId, email_verified } = payload;

        // creating last name by removing first name from full name
        const lastName = name.replace(given_name, '').trim();
        console.log("User Info: ", { given_name, lastName, email, googleSubId });

        const userData = await getUserByEmail(email);
        console.log("User Data: ", userData);

        if (!userData) {
            // User does not exist, create a new user in the database  
            return signUpUser({
                firstName: given_name,
                lastName: lastName,
                email: email,
                googleSubId: googleSubId,
                isVerified: email_verified
            })
        }

        return signInUser(userData)

        /*
        Two cases to handle:
        1. User already exists in the database, so we can log them in.
            -
        2. User does not exist, so we need to create a new user in the database.
        
        */
    } catch (error) {
        logError(error, __filename);
        return { Error: true, message: responseMessages.ERROR_CONSTANTS.INTERNAL_SERVER_ERROR };
    }
};

module.exports = handleGoogleAuthCallback;