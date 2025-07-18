const sendResponse = require('../../../../utils/responseHandler');
const handleInterviewObjectMetaHandler = require('./controller.interviewMeta');
const authMiddleware = require('../../../../utils/authMiddleware');
const { GET_INTERVIEW_META_OBJECT } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const InterviewObjectMetaHandler = async (req, res, next) => {

    try {
        logger.info('InterviewObjectMetaHandler request received', {
            interviewId: req.path.id, // Assuming userId is set in the request by authentication middleware
            path: GET_INTERVIEW_META_OBJECT.path,
            method: GET_INTERVIEW_META_OBJECT.method
        });


        const result = await handleInterviewObjectMetaHandler({ 
            interviewId: parseInt(req.params.id), // Assuming userId is set in the request by authentication middleware
            userId: req.user.id,
        });

        if (result.Error) {
            logger.warn('InterviewObjectMetaHandler request failed', {
                userId: req.user.id, // Assuming userId is set in the request by authentication middleware
                error: result.message
            });
            return sendResponse(res, 400, false, null, result.message);
        }

        logger.info('InterviewObjectMetaHandler request successful', {
            interviewId: req.params.id, // Assuming the controller returns userId
        });

        sendResponse(res, 200, true, result.data, result.message);
    } catch (error) {
        logger.error('Unexpected error in login route', {
            interviewId: req.params.id, // Assuming userId is set in the request by authentication middleware
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = { 
    path: GET_INTERVIEW_META_OBJECT.path, 
    method: GET_INTERVIEW_META_OBJECT.method, 
    handler: InterviewObjectMetaHandler, 
    auth: true, // Assuming this route requires authentication
    };
