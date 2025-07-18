const {
    insertTabSwitch
} = require('../../../../../models/queries/query.interview');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');

const handleTabSwitch = async ({ userInterviewId, userId }) => {
    try {
        logger.info('Tab Switch Controller starting...', { userId, userInterviewId });

        const tabSwitchCount = await insertTabSwitch(userInterviewId, userId);
        
        if(!tabSwitchCount) {
            logger.info('Tab Switch Controller error...', { userId , userInterviewId, tabSwitchCount });
            return {
                Error: true,
                status: 400,
                message: 'Error inserting tab switch!!',
            }
        }

        logger.info('Tab Switch Controller completed...', { userId , userInterviewId, tabSwitchCount});

        return {
            Error: false,
            data: tabSwitchCount,
            message: 'Tab switch inserted successfully.'
        };
    } catch (error) {
        logError(error, __filename, { userInterviewId, error });
        throw error;
    }
};

module.exports = handleTabSwitch; 