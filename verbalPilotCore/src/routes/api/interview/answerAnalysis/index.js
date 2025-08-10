const sendResponse = require('../../../../utils/responseHandler');
const handleAnswerAnalysis = require('./controller.answerAnalysis');
const { ANSWER_ANALYSIS } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const answerAnalysisHandler = async (req, res, next) => {
    const userAssessmentQuestionId = req.params.questionid;
    const userId = req.user.id;
    try {
        logger.info('answerAnalysisHandler request received', { userId, userAssessmentQuestionId });
        const result = await handleAnswerAnalysis({ userId, userAssessmentQuestionId });
        if (result.Error) {
            logger.warn('answerAnalysisHandler failed', { userId, userAssessmentQuestionId, error: result.message });
            return sendResponse(res, result.status || 400, false, null, result.message);
        }
        logger.info('answerAnalysisHandler successful', { userId, userAssessmentQuestionId });
        sendResponse(res, result.status || 200, true, result.data, result.message);
    } catch (error) {
        logger.error('Unexpected error in answerAnalysisHandler route', {
            userId,
            userAssessmentQuestionId,
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = {
    path: ANSWER_ANALYSIS.path,
    method: ANSWER_ANALYSIS.method,
    handler: answerAnalysisHandler,
    auth: true
}; 