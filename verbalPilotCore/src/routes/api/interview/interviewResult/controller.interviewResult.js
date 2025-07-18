const {
    userInterviewResult
} = require('../../../../../models/queries/query.interview');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');

const handleInterviewResult = async ({ userInterviewId, userId }) => {
    try {
        logger.info('User Interview Result Controller starting...', { userId, userInterviewId });

        const userInterviewResultRows = await userInterviewResult(userInterviewId, userId);
        
        if(!userInterviewResultRows) {
            logger.info('User Interview Result Controller error...', { userId , userInterviewId, userInterviewResultRows });
            return {
                Error: true,
                status: 400,
                message: 'Error retrieving result!!',
            }
        }

        logger.info('User Interview Result Controller completed...', { userId , userInterviewId, userInterviewResultRows});

        return {
            Error: false,
            data: userInterviewResultRows,
            message: 'Successful in retrieving result.'
        };
    } catch (error) {
        logError(error, __filename, { userInterviewId, error });
        throw error;
    }
};

module.exports = handleInterviewResult; 