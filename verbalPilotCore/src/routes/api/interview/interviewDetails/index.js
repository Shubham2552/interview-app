const sendResponse = require('../../../../utils/responseHandler');
const handleInteviewDetails = require('./controller.interviewDetails');
const { INTEVIEW_DETAILS } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const interviewDetailsHandler = async (req, res, next) => {
    const userInterviewId = req.params.id;
    const userId = req.user.id;
    

    try {
        logger.info('Inteview Details Starting...', { userInterviewId, userId});
        const result = await handleInteviewDetails({ userInterviewId, userId });
        if (result.Error) {
            logger.warn('Inteview Details Error...', { userId, userInterviewId, error: result.message });
            return sendResponse(res, result.status, false, null, result.message);
        }
        logger.info('Inteview Details Success...', { userId, userInterviewId});
        sendResponse(res, 200, true, result.data, result.message);
    } catch (error) {
        logger.error('Unexpected error in Interview Details', {
            userInterviewId,
            userId,
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = {
    path: INTEVIEW_DETAILS.path,
    method: INTEVIEW_DETAILS.method,
    handler: interviewDetailsHandler,
    auth: true
}; 