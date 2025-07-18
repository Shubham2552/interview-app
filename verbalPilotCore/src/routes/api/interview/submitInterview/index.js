const sendResponse = require('../../../../utils/responseHandler');
const handleSubmitResponse = require('./controller.submitResponse');
const { SUBMIT_RESPONSE } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const submitResponseHandler = async (req, res, next) => {
    const userInterviewId = req.params.id;
    const userId = req.user.id;
    const { question, answer, status, questionId } = req.body;
    try {
        logger.info('Submit response request received', { userInterviewId, status, questionId });
        const result = await handleSubmitResponse({ userInterviewId, question, answer, status, interviewQuestionId: questionId, userId });
        if (result.Error) {
            logger.warn('Submit response failed', { userInterviewId, error: result.message });
            return sendResponse(res, 400, false, null, result.message);
        }
        logger.info('Submit response successful', { userInterviewId });
        sendResponse(res, 200, true, result.data, result.message);
    } catch (error) {
        logger.error('Unexpected error in submit response route', {
            userInterviewId,
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = {
    path: SUBMIT_RESPONSE.path,
    method: SUBMIT_RESPONSE.method,
    handler: submitResponseHandler,
    auth: true
}; 