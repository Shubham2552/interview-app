const { responseMessages } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');
const { googleClient } = require('../../../../utils/auth/googleAuth/client.googleAuth');
const { getUserByEmail, revokeUserTokens, insertUserToken } = require('../../../../../models/queries/query.user');
const jwt = require('jsonwebtoken');
const { JWT_EXPIRY } = process.env;

const signInUser = async (userData) => {

    const expirySeconds = parseInt(JWT_EXPIRY) || 86400; // Default to 24 hours if parsing fails

    // Generate JWT token
    const token = jwt.sign(
        {
            id: userData.id,
            email: userData.email,
            isVerified: userData.is_verified
        },
        process.env.JWT_SECRET,
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
        const { name, email, given_name, sub: googleSubId } = payload;

        // creating last name by removing first name from full name
        const lastName = name.replace(given_name, '').trim();
        console.log("User Info: ", { given_name, lastName, email, googleSubId });

        const userData = await getUserByEmail(email);
        console.log("User Data: ", userData);

        if (!userData) {
            // User does not exist, create a new user in the database  

        }

        return signInUser(userData)

        /*
        Two cases to handle:
        1. User already exists in the database, so we can log them in.
            -
        2. User does not exist, so we need to create a new user in the database.
        
        */



        return {
            Error: false,
            data: null,
            message: 'Google Auth Callback processed successfully',
        }

    } catch (error) {
        logError(error, __filename);
        return { Error: true, message: responseMessages.ERROR_CONSTANTS.INTERNAL_SERVER_ERROR };
    }
};

module.exports = handleGoogleAuthCallback;