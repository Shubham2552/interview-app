const sendEmail = require('../../utils/email/emailSender');
const { EMAIL_TEMPLATES, responseMessages } = require('../../constant/genericConstants/commonConstant');
const logger = require('../../utils/logger');

/**
 * Sends an email using the given type and template data.
 * @param {Object} params
 * @param {string} params.type - The email template type key (e.g., 'waitlistThankYou', 'forgotPassword')
 * @param {string} params.to - Recipient email address
 * @param {Object} params.templateData - Data for the email template
 */
const sendGenericEmail = async ({ type, to, templateData }) => {
    const context = {
        email: to,
        emailType: type
    };

    try {
        logger.info(`Sending ${type} email`, { ...context });

        const templateConfig = EMAIL_TEMPLATES[type];
        if (!templateConfig) {
            logger.error('Invalid email type provided', { ...context });
            return { Error: true, message: 'Invalid email type.' };
        }

        const emailResponse = await sendEmail({
            to,
            subject: templateConfig.subject,
            template: templateConfig.templateName,
            templateData
        });

        if (!emailResponse.success) {
            logger.error(`Failed to send ${type} email`, {
                ...context,
                error: emailResponse.message
            });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS[`${type.toUpperCase()}_SEND_EMAIL_ERROR`] || 'Failed to send email.' };
        }

        logger.info(`${type} email sent successfully`, {
            ...context,
            messageId: emailResponse.messageId
        });
        return { Error: false, message: responseMessages.SUCCESS_CONSTANTS[`${type.toUpperCase()}_SEND_EMAIL_SUCCESS`] || 'Email sent successfully.' };
    } catch (error) {
        logger.error(`Error in ${type} email process`, {
            ...context,
            error: error.message,
            stack: error.stack
        });
        return { Error: true, message: responseMessages.ERROR_CONSTANTS[`${type.toUpperCase()}_SEND_EMAIL_ERROR`] || 'Failed to send email.' };
    }
};

module.exports = {
    sendGenericEmail
};