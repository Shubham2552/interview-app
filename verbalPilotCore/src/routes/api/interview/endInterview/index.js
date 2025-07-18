const sendResponse = require('../../../../utils/responseHandler');
const handleEndInterview = require('./controller.endInterview');
const { END_INTERVIEW } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const endInterviewHandler = async (req, res, next) => {
    const userInterviewId = req.params.id;
    const userId = req.user.id;
    const  isTabSwitch  = parseInt(req.query.isTabSwitch);
    

    try {
        logger.info('End Interview Starting...', { userInterviewId, userId, isTabSwitch});
        const result = await handleEndInterview({ userInterviewId, userId, isTabSwitch });
        if (result.Error) {
            logger.warn('End Interview Error...', { userId, userInterviewId, error: result.message });
            return sendResponse(res, result.status, false, null, result.message);
        }
        logger.info('End Interview Success...', { userId, userInterviewId, isTabSwitch});
        sendResponse(res, 200, true, result.data, result.message);
    } catch (error) {
        logger.error('Unexpected error in submit response route', {
            userInterviewId,
            userId,
            isTabSwitch,
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = {
    path: END_INTERVIEW.path,
    method: END_INTERVIEW.method,
    handler: endInterviewHandler,
    auth: true
}; 