const { getUserProfileById } = require('../../../../../models/queries/query.user');
const { updateEmailVerification } = require('../../../../commonServices/users/sendEmailVerificationCode');
const { responseMessages, EMAIL_TEMPLATES } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');

const handleResendEmailVerification = async (id) => {
    const context = { userId: id };

    try {
        logger.info('Starting email verification resend process', { ...context });

        // Use direct query to get user profile
        const existingUser = await getUserProfileById(id);

        if (!existingUser) {
            logger.warn('Email verification resend failed: User not found', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.USER_NOT_FOUND };
        }

        context.email = existingUser.email;

        if(existingUser.isVerified) {
            logger.warn('Email verification resend failed: User already verified', { ...context });
            return {Error: true, message: responseMessages.ERROR_CONSTANTS.USER_ALREADY_VERIFIED};
        }

        await updateEmailVerification(existingUser, EMAIL_TEMPLATES.keys.RESEND);
        logger.info('Email verification code resent successfully', { ...context });

        return { Error: false, message: responseMessages.SUCCESS_CONSTANTS.EMAIL_VERIFICATION_CODE_RESEND_SUCCESSFULLY };
    } catch (error) {
        logError(error, __filename, context);
        return { Error: true, message: responseMessages.ERROR_CONSTANTS.INTERNAL_SERVER_ERROR };
    }
};

module.exports = handleResendEmailVerification;
