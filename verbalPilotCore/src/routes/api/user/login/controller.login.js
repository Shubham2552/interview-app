const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getUserByEmail, insertUserToken, revokeUserTokens } = require('../../../../../models/queries/query.user');
const { JWT_EXPIRY } = process.env;
const { responseMessages, tokenType } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');

const handleLogin = async ({email, password, deviceInfo, ipAddress}) => {
    const context = { email, ipAddress };
    
    try {
        logger.info('Login attempt', { ...context });

        const existingUser = await getUserByEmail(email);

        
        if (!existingUser) {
            logger.warn('Login failed: Email not found', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.EMAIL_NOT_FOUND };
        }
      
        if(existingUser.password === null) {
            return {
                Error: true,
                message: 'Password is not set!! Use forgot password or social login!!'
            }
        }
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordValid) {
            logger.warn('Login failed: Invalid password', { ...context, userId: existingUser.id });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.INVALID_PASSWORD };
        }

        // Parse JWT_EXPIRY to get seconds
        const expirySeconds = parseInt(JWT_EXPIRY) || 86400; // Default to 24 hours if parsing fails

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: existingUser.id, 
                email: existingUser.email, 
                isVerified: existingUser.is_verified 
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
        await revokeUserTokens(existingUser.id, 'access');

        // Insert new token
        await insertUserToken({
            userId: existingUser.id,
            token,
            jwtExpiry: expiryDate,
            tokenType: 'access',
            deviceInfo,
            ipAddress
        });

        logger.info('User authenticated successfully', { 
            ...context, 
            userId: existingUser.id,
            isVerified: existingUser.is_verified
        });

        logger.info('Login successful: Token created', { 
            ...context, 
            userId: existingUser.id
        });

        return {
            Error: false,
            message: responseMessages.SUCCESS_CONSTANTS.LOGIN_SUCCESSFUL,
            token,
            userId: existingUser.id
        };

    } catch (error) {
        logError(error, __filename, context);
        throw error; // Let the global error handler handle it
    }
};

module.exports = handleLogin; 