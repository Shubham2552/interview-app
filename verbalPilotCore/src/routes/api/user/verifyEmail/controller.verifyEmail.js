const { getUserVerificationDataById, setUserVerified } = require('../../../../../models/queries/query.user');
const { responseMessages } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');

const handleVerifyEmail = async (id, verificationCode) => {
    const context = { userId: id };

    try {
        logger.info('Starting email verification process', { ...context });

        // Use direct query to get user verification data
        const existingUser = await getUserVerificationDataById(id);

        if (!existingUser) {
            logger.warn('Email verification failed: User not found', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.USER_NOT_FOUND };
        }

        context.email = existingUser.email;

        if(existingUser.isVerified) {
            logger.warn('Email verification failed: User already verified', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.USER_ALREADY_VERIFIED };
        }

        if(verificationCode !== existingUser.verificationCode) {
            logger.warn('Email verification failed: Invalid verification code', { 
                ...context,
                providedCode: verificationCode
            });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.INVALID_VERIFCATION_CODE };
        }

        // Update the user's verification status using direct query
        await setUserVerified(id);
        logger.info('User email verified successfully', { ...context });

        return { 
            Error: false, 
            message: responseMessages.SUCCESS_CONSTANTS.USER_VERIFIED_SUCCESSFULLY,
            userId: existingUser.id
        };
    } catch (error) {
        logError(error, __filename, context);
        throw error; // Let the global error handler handle it
    }
};

module.exports = handleVerifyEmail;
