const sendResponse = require('../../../../utils/responseHandler');
const handleVerifyEmail = require('./controller.verifyEmail');
const { VERIFY_EMAIL } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const verifyEmailHandler = async (req, res, next) => {
    const context = {
        userId: req.user?.id,
        email: req.user?.email,
        path: VERIFY_EMAIL.path,
        method: VERIFY_EMAIL.method,
        verificationCode: req.query.code
    };

    try {
        logger.info('Email verification request received', { ...context });

        const { id } = req.user;
        const result = await handleVerifyEmail(id, req.query.code);

        if (result.Error) {
            logger.warn('Email verification failed', {
                ...context,
                Error: result.message
            });
            return sendResponse(res, 400, false, null, result.message);
        }

        logger.info('Email verified successfully', { ...context });
        sendResponse(res, 200, true, result.data, result.message);
    } catch (error) {
        logger.error('Unexpected error in email verification route', {
            ...context,
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = { 
    path: VERIFY_EMAIL.path,
    method: VERIFY_EMAIL.method, 
    handler: verifyEmailHandler, 
    auth:true
};
