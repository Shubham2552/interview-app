const { verificationCodeTypes, EMAIL_TEMPLATES } = require('../../constant/genericConstants/commonConstant');
const sendEmail = require('../../utils/email/emailSender');
const logger = require('../../utils/logger');

const updateEmailVerification = async (user, type = EMAIL_TEMPLATES.keys.SIGNUP) => {
    const context = {
        userId: user.id,
        email: user.email,
        emailType: type
    };

    try {
        logger.info('Generating verification code', { ...context });
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        await user.update({ verificationCode });
        logger.info('Verification code updated in database', { ...context });

        const emailResponse = await sendEmail({
            to: user.email,
            subject: EMAIL_TEMPLATES[type].subject,
            template: EMAIL_TEMPLATES[type].templateName,
            templateData: {
                name: `${user.firstName} ${user.lastName}`,
                verificationCode,
            },
        });

        if (emailResponse.success) {
            logger.info('Verification email sent successfully', {
                ...context,
                messageId: emailResponse.messageId
            });
        } else {
            logger.error('Failed to send verification email', {
                ...context,
                error: emailResponse.error
            });
        }

        return emailResponse;
    } catch (error) {
        logger.error('Error in email verification process', {
            ...context,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
};

module.exports = {
    updateEmailVerification
};
