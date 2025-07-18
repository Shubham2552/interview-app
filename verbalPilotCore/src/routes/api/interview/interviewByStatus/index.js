const sendResponse = require('../../../../utils/responseHandler');
const handleInterviewByStatus = require('./controller.interviewByStatus');
const { GET_INTERVIEW_BY_STATUS } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const InterviewByStatusHandler = async (req, res, next) => {

    try {
        const { status } = req.query;
        logger.info('InterviewByStatusHandler request received', {
            user: req.user,
            path: GET_INTERVIEW_BY_STATUS.path,
            method: GET_INTERVIEW_BY_STATUS.method
        });


        const result = await handleInterviewByStatus({ 
            status,
            UserId: req.user.id 
        });

        if (result.Error) {
            logger.warn('InterviewByStatusHandler request failed', {
                userId: req.user.id, // Assuming userId is set in the request by authentication middleware
                error: result.message
            });
            return sendResponse(res, 400, false, null, result.message);
        }

        logger.info('InterviewByStatusHandler request successful', {
            interviewId: req.params.id, // Assuming the controller returns userId
            user: req.user
        });

        sendResponse(res, 200, true, result.data, result.message);
    } catch (error) {
        logger.error('Unexpected error in InterviewByStatusHandler route', {
            interviewId: req.params.id, // Assuming userId is set in the request by authentication middleware
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = { 
    path: GET_INTERVIEW_BY_STATUS.path, 
    method: GET_INTERVIEW_BY_STATUS.method, 
    handler: InterviewByStatusHandler, 
    auth: true, // Assuming this route requires authentication
    };
