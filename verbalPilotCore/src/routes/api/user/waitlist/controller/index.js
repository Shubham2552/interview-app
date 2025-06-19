const { PreRegisterUser } = require('../../../../../../models');
const logger = require('../../../../../utils/logger');
const { responseMessages, EMAIL_TEMPLATES } = require('../../../../../constant/genericConstants/commonConstant');
const { sendGenericEmail } = require('../../../../../commonServices/users/genericEmailSender');

const handleWaitlist = async ({ email, ipAddress, deviceInfo, name }) => {
    try {
        // Always create a new pre-register user entry, even if email exists
        const user = await PreRegisterUser.create({
            email,
            ipAddress,
            deviceInfo: JSON.stringify(deviceInfo)
        });
        

        logger.info('New user added to waitlist', { 
            email,
            userId: user.id,
            ipAddress,
            deviceInfo
        });


        // Send waitlist thank you email using generic sender
        logger.info('Sending waitlist thank you email', { email, userId: user.id });

        const waitlistEmailResponse = await sendGenericEmail({
            type: EMAIL_TEMPLATES.keys.WAITLIST,
            to: email,
            templateData: null
        });

        if (waitlistEmailResponse.Error) {
            logger.error('Failed to send waitlist thank you email', {
                email,
                userId: user.id,
                error: waitlistEmailResponse.message
            });
        }

        return {
            Error: false,
            message: responseMessages.SUCCESS_CONSTANTS.ADDED_TO_WAITLIST_SUCCESSFUL,
        };

    } catch (error) {
        logger.error('Waitlist registration error:', {
            error: error.message,
            stack: error.stack,
            email
        });
        
        return {
            Error: true,
            message: responseMessages.ERROR_CONSTANTS.INTERNAL_SERVER_ERROR,
            data: null
        };
    }
};

module.exports = handleWaitlist;