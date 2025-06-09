const { PreRegisterUser, PreRegisterPersonalization } = require('../../../../../models');
const logger = require('../../../../../utils/logger');

const handleSurvey = async ({ surveyEmail, roles, jobHunting, challenges, willPay, featureSuggestion, ipAddress, deviceInfo }) => {
    try {

        // Find or create pre-register user
        let [user, created] = await PreRegisterUser.findOrCreate({
            where: { email: surveyEmail },
            defaults: { 
                status: 'SURVEY_COMPLETED',
                ipAddress,
                deviceInfo: JSON.stringify(deviceInfo),
                lastActivityAt: new Date()
            }
        });

        if (!created) {
            // Update existing user's status and info
            await user.update({ 
                status: 'SURVEY_COMPLETED',
                ipAddress,
                deviceInfo: JSON.stringify(deviceInfo),
                lastActivityAt: new Date()
            });
        }

        // Create or update personalization
        const [personalization, wasCreated] = await PreRegisterPersonalization.findOrCreate({
            where: { userId: user.id },
            defaults: {
                roles,
                jobHunting,
                challenges,
                willPay,
                featureSuggestion,
                lastUpdatedAt: new Date()
            }
        });

        if (!wasCreated) {
            // Update existing personalization with timestamp
            await personalization.update({
                roles,
                jobHunting,
                challenges,
                willPay,
                featureSuggestion,
                lastUpdatedAt: new Date()
            });
        }

        logger.info('Survey submitted successfully', { 
            email: surveyEmail,
            userId: user.id,
            isNewUser: created,
            isNewPersonalization: wasCreated,
            ipAddress,
            deviceInfo
        });

        return {
            error: false,
            message: 'Survey submitted successfully',
            data: {
                userId: user.id,
                isNewSubmission: wasCreated,
                submittedAt: personalization.lastUpdatedAt
            }
        };

    } catch (error) {
        logger.error('Survey submission error:', {
            error: error.message,
            stack: error.stack,
            email: surveyEmail
        });
        
        return {
            error: true,
            message: 'Failed to submit survey',
            data: null
        };
    }
};

module.exports = handleSurvey; 