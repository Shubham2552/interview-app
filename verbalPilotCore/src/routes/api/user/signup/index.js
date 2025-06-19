const sendResponse = require('../../../../utils/responseHandler');
const handleSignup = require('./controller');
const { validateSignUp } = require('./validation');
const { SIGN_UP } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const signUpHandler = async (req, res, next) => {
    const context = {
        email: req.body.email,
        ipAddress: req.clientIp || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
    };

    try {
        logger.info('Signup request received', {
            ...context,
            path: SIGN_UP.path,
            method: SIGN_UP.method
        });
            
        const result = await handleSignup({
            ...req.body,
            deviceInfo: context.userAgent,
            ipAddress: context.ipAddress,
        });

        if (result.Error) {
            logger.warn('Signup request failed', {
                ...context,
                error: result.message
            });
            return sendResponse(res, 400, false, null, result.message);
        }

        logger.info('Signup request successful', {
            ...context,
            userId: result.userId // Assuming the controller returns userId
        });

        sendResponse(res, 200, true, { token: result.token }, result.message);
    } catch (error) {
        logger.error('Unexpected error in signup route', {
            ...context,
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = { 
    path: SIGN_UP.path,
    method: SIGN_UP.method,
    handler: signUpHandler, 
    middleware: [validateSignUp] 
};
