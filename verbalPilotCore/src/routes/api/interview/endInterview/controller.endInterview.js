const {
    endInterviewQuery
} = require('../../../../../models/queries/query.interview');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');

const handleEndInterview = async ({ userInterviewId, userId, isTabSwitch }) => {
    try {
        logger.info('End Interview Controller starting...', { userId, userInterviewId, isTabSwitch });

        const endInterviewRow = await endInterviewQuery(userInterviewId, userId, isTabSwitch);
        
        if(!endInterviewRow) {
            logger.info('End Interview Controller error...', { userId , userInterviewId, endInterviewRow, isTabSwitch });
            return {
                Error: true,
                status: 404,
                message: 'Interview Not Found!!',
            }
        }

        logger.info('End Interview Controller completed...', { userId , userInterviewId, endInterviewRow, isTabSwitch });

        return {
            Error: false,
            data: null,
            message: 'End Interview Successful.'
        };
    } catch (error) {
        logError(error, __filename, { userInterviewId, error });
        throw error; // Let the global error handler handle it
    }
};

module.exports = handleEndInterview; 