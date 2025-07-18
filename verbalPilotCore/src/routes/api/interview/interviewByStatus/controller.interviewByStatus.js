const { getUserInterviewsByStatus } = require('../../../../../models/queries/query.interview');
const { responseMessages } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');

const handleInterviewByStatus = async ({ status, UserId }) => {
    try {
        logger.info('Starting handleInterviewByStatus process', { UserId, status });

        // Convert status to uppercase
        const upperCaseStatus = status.toUpperCase();
        
        const userInterviews = await getUserInterviewsByStatus(UserId, upperCaseStatus);

        if (!userInterviews || userInterviews.length === 0) {
            logger.info('No interviews found for user with status', { UserId, status: upperCaseStatus });
            return { 
                Error: false, 
                data: [], 
                message: `No interviews found with status: ${upperCaseStatus}` 
            };
        }

        logger.info('Fetched user interviews by status', { UserId, status: upperCaseStatus, count: userInterviews.length });

        return { 
            Error: false, 
            data: userInterviews, 
            message: responseMessages.SUCCESS_CONSTANTS.USER_INTERVIEWS_FETCHED_SUCCESSFULLY 
        };
    } catch (error) {
        logError(error, __filename, { UserId, status });
        throw error; // Let the global error handler handle it
    }
};

module.exports = handleInterviewByStatus;