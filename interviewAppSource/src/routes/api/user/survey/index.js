const sendResponse = require('../../../../utils/responseHandler');
const handleSurvey = require('./controller');
const { validateSurvey } = require('./validation');
const { SURVEY } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const surveyHandler = async (req, res, next) => {
    const context = {
        email: req.body.surveyEmail,
        ipAddress: req.clientIp || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
    };

    try {
        logger.info('Survey request received', {
            ...context,
            path: SURVEY.path,
            method: SURVEY.method
        });
            
        const result = await handleSurvey({
            ...req.body,
            deviceInfo: context.userAgent,
            ipAddress: context.ipAddress,
        });

        if (result.Error) {
            logger.warn('Survey request failed', {
                ...context,
                error: result.message
            });
            return sendResponse(res, 400, false, null, result.message);
        }

        logger.info('Survey request successful', {
            ...context,
            userId: result.userId
        });

        sendResponse(res, 200, true, { userId: result.userId }, result.message);
    } catch (error) {
        logger.error('Unexpected error in survey route', {
            ...context,
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = { 
    path: SURVEY.path,
    method: SURVEY.method,
    handler: surveyHandler, 
    middleware: [validateSurvey] 
}; 