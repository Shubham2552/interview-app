const sendResponse = require('../../../../utils/responseHandler');
const handleLogin = require('./controller.login');
const validateLogin = require('./validate.login');
const { LOGIN } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const loginHandler = async (req, res, next) => {
    const context = {
        email: req.body.email,
        ipAddress: req.clientIp || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
    };

    try {
        logger.info('Login request received', {
            ...context,
            path: LOGIN.path,
            method: LOGIN.method
        });

        const { email, password } = req.body;

        const result = await handleLogin({ 
            email, 
            password, 
            ipAddress: context.ipAddress, 
            deviceInfo: context.userAgent 
        });

        if (result.Error) {
            logger.warn('Login request failed', {
                ...context,
                error: result.message
            });
            return sendResponse(res, 400, false, null, result.message);
        }

        logger.info('Login request successful', {
            ...context,
            userId: result.userId
        });

        sendResponse(res, 200, true, { token: result.token }, result.message);
    } catch (error) {
        logger.error('Unexpected error in login route', {
            ...context,
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = { 
    path: LOGIN.path, 
    method: LOGIN.method, 
    handler: loginHandler, 
    middleware: [validateLogin] 
};
