const sendResponse = require('../../../../utils/responseHandler');
const handleAnswerAnalysis = require('./controller.answerAnalysis');
const { GENERATE_ASSESSMENT_REPORT } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const answerAnalysisHandler = async (req, res, next) => {
    const userAssessmentQuestionId = req.params.questionId;
    const userId = req.user.id;
    try {
        logger.info('answerAnalysisHandler request received', { userInterviewId });
        const result = await handleAnswerAnalysis({ userAssessmentQuestionId, userId });
        if (result.Error) {
            logger.warn('answerAnalysisHandler failed', { userInterviewId, error: result.message });
            return sendResponse(res, result.status || 400, false, null, result.message);
        }
        logger.info('answerAnalysisHandler successful', { userInterviewId });
        sendResponse(res, result.status || 200, true, result.data, result.message);
    } catch (error) {
        logger.error('Unexpected error in answerAnalysisHandler route', {
            userInterviewId,
            userId,
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = {
    path: GENERATE_ASSESSMENT_REPORT.path,
    method: GENERATE_ASSESSMENT_REPORT.method,
    handler: answerAnalysisHandler,
    auth: true
}; 