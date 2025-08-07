const sendResponse = require('../../../../utils/responseHandler');
const handleInterviewResult = require('./controller.interviewResult');
const { ASSESSMENT_ANSWERS } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const interviewResultHandler = async (req, res, next) => {
    const userInterviewId = req.params.id;
    const userId = req.user.id;
    

    try {
        logger.info('Interview Result Starting...', { userInterviewId, userId});
        const result = await handleInterviewResult({ userInterviewId, userId });
        if (result.Error) {
            logger.warn('Interview Result Error...', { userId, userInterviewId, error: result.message });
            return sendResponse(res, result.status, false, null, result.message);
        }
        logger.info('Interview Result Success...', { userId, userInterviewId});
        sendResponse(res, 200, true, result.data, result.message);
    } catch (error) {
        logger.error('Unexpected error in submit response route', {
            userInterviewId,
            userId,
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = {
    path: ASSESSMENT_ANSWERS.path,
    method: ASSESSMENT_ANSWERS.method,
    handler: interviewResultHandler,
    auth: true
}; 