const sendResponse = require('../../../../utils/responseHandler');
const handleAvailableInterview = require('./controller.interviewMeta');
const authMiddleware = require('../../../../utils/authMiddleware');
const { GET_AVAILAIBLE_INTERVIEWS } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const availableInterviewsHandler = async (req, res, next) => {

    try {
        logger.info('availableInterviewsHandler request received', {
            userId: req.user.id, // Assuming userId is set in the request by authentication middleware
            path: GET_AVAILAIBLE_INTERVIEWS.path,
            method: GET_AVAILAIBLE_INTERVIEWS.method
        });


        const result = await handleAvailableInterview({ 
            userId: req.user.id, // Assuming userId is set in the request by authentication middleware
        });

        if (result.Error) {
            logger.warn('availableInterviewsHandler request failed', {
                userId: req.user.id, // Assuming userId is set in the request by authentication middleware
                error: result.message
            });
            return sendResponse(res, 400, false, null, result.message);
        }

        logger.info('availableInterviewsHandler request successful', {
            userId: result.userId // Assuming the controller returns userId
        });

        sendResponse(res, 200, true, result.interviews, result.message);
    } catch (error) {
        logger.error('Unexpected error in login route', {
            userId: req.userId, // Assuming userId is set in the request by authentication middleware
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = { 
    path: GET_AVAILAIBLE_INTERVIEWS.path, 
    method: GET_AVAILAIBLE_INTERVIEWS.method, 
    handler: availableInterviewsHandler, 
    auth: true, // Assuming this route requires authentication
    };
