const sendResponse = require('../../../../utils/responseHandler');
const handleStartInterview = require('./controller.startInterview');
const { START_INTERVIEW } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const StartInterviewHandler = async (req, res, next) => {

    try {
        logger.info('StartInterviewHandler request received', {
            userId: req.user.id, // Assuming userId is set in the request by authentication middleware
            body: req.body, // Assuming userId is set in the request by authentication middleware
            path: START_INTERVIEW.path,
            method: START_INTERVIEW.method
        });
        const { interviewObjectId, questionProperties, answerProperties } = req.body;
        const UserId = req.user.id;


        const result = await handleStartInterview({ 
            interviewObjectId,
            questionProperties,
            answerProperties,
            UserId
        });

        if (result.Error) {
            logger.warn('StartInterviewHandler request failed', {
                user: req.user, // Assuming userId is set in the request by authentication middleware
                error: result.message
            });
            return sendResponse(res, result.status || 400, false, null, result.message);
        }

        logger.info('StartInterviewHandler request successful', {
            interviewId: req.params.id, // Assuming the controller returns userId
        });

        sendResponse(res, 200, true, result.data, result.message);
    } catch (error) {
        logger.error('Unexpected error in login route', {
            user: req.user,
            body: req.body, // Assuming userId is set in the request by authentication middleware
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = { 
    path: START_INTERVIEW.path, 
    method: START_INTERVIEW.method, 
    handler: StartInterviewHandler, 
    auth: true, // Assuming this route requires authentication
    };
