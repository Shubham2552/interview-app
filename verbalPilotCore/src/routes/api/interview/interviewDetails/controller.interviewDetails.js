const {
    interviewUserProperties
} = require('../../../../../models/queries/query.interview');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');

const handleInterviewDetails = async ({ userInterviewId, userId }) => {
    try {
        logger.info('Interview Details Controller starting...', { userId, userInterviewId });

        const userInterviewDetails = await interviewUserProperties(userId, userInterviewId);
        
        if(!userInterviewDetails) {
            logger.info('Interview Details Controller error...', { userId , userInterviewId, userInterviewDetails });
            return {
                Error: true,
                status: 400,
                message: 'Error retrieving interview details!!',
            }
        }

        logger.info('Interview Details Controller completed...', { userId , userInterviewId, userInterviewDetails});

        return {
            Error: false,
            data: userInterviewDetails,
            message: 'Retrieving details successful!'
        };
    } catch (error) {
        logError(error, __filename, { userInterviewId, error });
        throw error;
    }
};

module.exports = handleInterviewDetails; 