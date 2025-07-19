const sendEmail = require('../../utils/email/emailSender');
const { EMAIL_TEMPLATES, responseMessages } = require('../../constant/genericConstants/commonConstant');
const logger = require('../../utils/logger');
const { getUserForPasswordResetByEmail } = require('../../../models/queries/query.user');

const sendForgotPasswordEmail = async ({ email, resetLink, type }) => {
    // Fetch user by email using the new query
    const user = await getUserForPasswordResetByEmail(email);
    const context = {
        userId: user ? user.id : undefined,
        email: email,
        emailType: type
    };

    if (!user) {
        logger.error('User not found for password reset', { ...context });
        return { Error: true, message: responseMessages.ERROR_CONSTANTS.USER_NOT_FOUND };
    }

    try {
        logger.info('Sending password reset email', { ...context });

        const resetPasswordEmailResponse = await sendEmail({
            to: user.email,
            subject: EMAIL_TEMPLATES[type].subject,
            template: EMAIL_TEMPLATES[type].templateName,
            templateData: {
                name: `${user.firstName} ${user.lastName}`,
                resetLink,
            },
        });

        if (!resetPasswordEmailResponse.success) {
            logger.error('Failed to send password reset email', {
                ...context,
                error: resetPasswordEmailResponse.message
            });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.FORGOT_PASSWORD_SEND_EMAIL_ERROR };
        }

        logger.info('Password reset email sent successfully', {
            ...context,
            messageId: resetPasswordEmailResponse.messageId
        });
        return { Error: false, message: responseMessages.SUCCESS_CONSTANTS.SEND_FORGOT_PASSWORD_EMAIL_SUCCESS };
    } catch (error) {
        logger.error('Error in password reset email process', {
            ...context,
            error: error.message,
            stack: error.stack
        });
        return { Error: true, message: responseMessages.ERROR_CONSTANTS.FORGOT_PASSWORD_SEND_EMAIL_ERROR };
    }
};

module.exports = {
    sendForgotPasswordEmail
};
