const sendResponse = require('../../../../utils/responseHandler');
const handleAssessmentReport = require('./controller.assessmentReport');
const { GENERATE_ASSESSMENT_REPORT } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const assessmentReportHandler = async (req, res, next) => {
    const userInterviewId = req.params.id;
    const userId = req.user.id;
    try {
        logger.info('assessmentReportHandler request received', { userInterviewId });
        const result = await handleAssessmentReport({ userInterviewId, userId });
        if (result.Error) {
            logger.warn('assessmentReportHandler failed', { userInterviewId, error: result.message });
            return sendResponse(res, result.status || 400, false, null, result.message);
        }
        logger.info('assessmentReportHandler successful', { userInterviewId });
        sendResponse(res, result.status || 200, true, result.data, result.message);
    } catch (error) {
        logger.error('Unexpected error in assessmentReportHandlerroute', {
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
    handler: assessmentReportHandler,
    auth: true
}; 