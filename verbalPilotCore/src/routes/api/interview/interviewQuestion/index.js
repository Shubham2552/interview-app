const sendResponse = require('../../../../utils/responseHandler');
const handleInterviewQuestion = require('./controller.InterviewQuestion');
const { GET_INTERVIEW_QUESTION } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const InterviewQuestionHandler = async (req, res, next) => {

    try {
        logger.info('InterviewQuestionHandler request received', {
            user: req.user,
            path: GET_INTERVIEW_QUESTION.path,
            method: GET_INTERVIEW_QUESTION.method
        });


        const result = await handleInterviewQuestion({
            interviewId: req.params.id,
            userId: req.user.id,
        });

        if (result.Error) {
            logger.warn('InterviewQuestionHandler request failed', {
                user: req.user,
                error: result.message
            });
            return sendResponse(res, result.status || 400, false, null, result.message);
        }

        logger.info('InterviewQuestionHandler request successful', {
            user: req.user,
            response: result.data
        });

        sendResponse(res, result.status || 200, true, result.data, result.message);
    } catch (error) {
        logger.error('Unexpected error in login route', {
            interviewId: req.params.id,
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = {
    path: GET_INTERVIEW_QUESTION.path,
    method: GET_INTERVIEW_QUESTION.method,
    handler: InterviewQuestionHandler,
    auth: true,
};
