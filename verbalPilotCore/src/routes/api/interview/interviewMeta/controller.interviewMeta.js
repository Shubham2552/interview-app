const { getInterviewObjectMeta } = require('../../../../../models/queries/query.interview');
const { responseMessages } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');

const handleInterviewObjectMetaHandler = async ({ interviewId, userId }) => {
    try {
        logger.info('Starting handleInterviewObjectMetaHandler process', { interviewId, userId });

        const interviewObject = await getInterviewObjectMeta(userId, interviewId);
        
        if (!interviewObject) {
            logger.warn('Interview object not found or user does not have access', { interviewId, userId });
            return { Error: true, data: null, message: responseMessages.ERROR_CONSTANTS.INTERVIEW_OBJECT_META_NOT_FOUND };
        }
   
        return { Error: false, data: interviewObject, message: responseMessages.SUCCESS_CONSTANTS.INTERVIEW_OBJECT_META_FETCHED };
    } catch (error) {
        logError(error, __filename, { interviewId, userId });
        throw error; // Let the global error handler handle it
    }
};

module.exports = handleInterviewObjectMetaHandler;