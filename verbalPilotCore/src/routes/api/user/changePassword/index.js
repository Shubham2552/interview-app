const sendResponse = require('../../../../utils/responseHandler');
const handleChangePassword = require('./controller');
const validateChangePassword = require('./validation');
const authMiddleware = require('../../../../utils/authMiddleware');
const { CHANGE_PASSWORD } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const changePasswordHandler = async (req, res, next) => {
    const context = {
        userId: req.user?.id,
        email: req.user?.email,
        path: CHANGE_PASSWORD.path,
        method: CHANGE_PASSWORD.method
    };

    try {
        logger.info('Change password request received', { ...context });

        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        const result = await handleChangePassword({ userId, oldPassword, newPassword });

        if (result.Error) {
            logger.warn('Change password request failed', {
                ...context,
                error: result.message
            });
            return sendResponse(res, 400, false, null, result.message);
        }

        logger.info('Password changed successfully', { ...context });
        sendResponse(res, 200, true, null, result.message);
    } catch (error) {
        logger.error('Unexpected error in change password route', {
            ...context,
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = {
    path: CHANGE_PASSWORD.path,
    method: CHANGE_PASSWORD.method,
    handler: changePasswordHandler,
    middleware: [authMiddleware, validateChangePassword]
};