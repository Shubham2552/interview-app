const { RESET_PASSWORD } = require('../../../../constant/pathConstants');
const queryTokenMiddleware = require('../../../../utils/queryTokenMiddleware');
const handleResetPassword = require('./controller.resetPassword');
const sendResponse = require('../../../../utils/responseHandler');
const { responseMessages } = require('../../../../constant/genericConstants/commonConstant');

const resetPasswordHandler = async (req, res, next) => {
    console.log('Request User:', req.user);

    try {
        const { id } = req.user;
        const { newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            return sendResponse(res, 400, false, null, responseMessages.ERROR_CONSTANTS.CONFIRM_PASSWORD_MISMATCH);
        }
        const result = await handleResetPassword(id, newPassword);
        if (result.Error) {
            return sendResponse(res, 400, false, null, result.message);
        }
        sendResponse(res, 200, true, null, result.message);
    } catch (error) {
    console.error('Error in resetPasswordHandler:', error);
        next(error);
    }
}

module.exports = {
    path: RESET_PASSWORD.path,
    method: RESET_PASSWORD.method,
    handler: resetPasswordHandler,
    middleware: [queryTokenMiddleware]
}