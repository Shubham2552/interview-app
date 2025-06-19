const { PreRegisterPersonalization } = require('../../../../../../models');
const logger = require('../../../../../utils/logger');
const { responseMessages, EMAIL_TEMPLATES } = require('../../../../../constant/genericConstants/commonConstant');
const { sendGenericEmail } = require('../../../../../commonServices/users/genericEmailSender');

const handleSurvey = async ({ surveyEmail, roles, jobHunting, challenges, willPay, featureSuggestion, ipAddress, deviceInfo }) => {
    try {
        const personalization = await PreRegisterPersonalization.create({
            email: surveyEmail,
            roles,
            jobHunting,
            challenges,
            willPay,
            featureSuggestion,
            deviceInfo,
            ipAddress
        });

        logger.info('Survey personalization entry created', {
            email: surveyEmail,
            personalizationId: personalization.id,
            ipAddress,
            deviceInfo
        });

        const preRegistrationSurveryMailResponse = await sendGenericEmail({
            type: EMAIL_TEMPLATES.keys.PRE_REGISTRATION_SURVEY,
            to: surveyEmail,
            templateData: null
        });

        if (preRegistrationSurveryMailResponse.Error) {
            logger.error('Failed to send waitlist thank you email', {
                surveyEmail,
                userId: personalization.id,
                error: preRegistrationSurveryMailResponse.message
            });
        }


        return {
            Error: false,
            message: responseMessages.SUCCESS_CONSTANTS.SURVEY_SUBMITTED_SUCCESSFULLY,
            data: {
                personalizationId: personalization.id,
                submittedAt: personalization.createdAt
            }
        };

    } catch (error) {
        logger.error('Survey submission error:', {
            error: error.message,
            stack: error.stack,
            email: surveyEmail
        });

        return {
            Error: true,
            message: responseMessages.ERROR_CONSTANTS.SURVEY_SUBMIT_FAILED,
            data: null
        };
    }
};

module.exports = handleSurvey;