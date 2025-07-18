const { getAvailableInterviews } = require('../../../../../models/queries/query.interview');
const { responseMessages } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');

const handleAvailableInterview = async ({ userId }) => {
    try {
        logger.info('Starting handleAvailableInterview process', { userId });

        const interviews = await getAvailableInterviews(userId);

        if (!interviews || interviews.length === 0) {
            logger.info('No available interviews found for user', { userId });
            return { Error: false, interviews: [], message: 'No interviews available for this user.' };
        }

        logger.info('Fetched available interviews', { userId, interviewCount: interviews.length });
        return { 
            Error: false, 
            interviews, 
            message: responseMessages.SUCCESS_CONSTANTS.USER_INTERVIEWS_FETCHED_SUCCESSFULLY 
        };
    } catch (error) {
        logError(error, __filename, { userId });
        throw error; // Let the global error handler handle it
    }
};

module.exports = handleAvailableInterview;