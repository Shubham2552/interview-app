const sendResponse = require('../../../../utils/responseHandler');
const { FORGOT_PASSWORD } = require('../../../../constant/pathConstants');
const handleForgotPassword = require('./controller.forgotPassword');

const forgotPasswordHandler = async (req, res, next) => {
    try {
        const { email } = req.query;
        console.log(`Received forgot password request for email: ${email}`);
        const result = await handleForgotPassword({
            email,
            ipAddress: req.clientIp || 'unknown',
            deviceInfo: req.headers['user-agent'] || 'unknown'
        });
        console.log(`Forgot password result:`, result);
        if (result.Error) {
            return sendResponse(res, 400, false, null, result.message);
        }
        sendResponse(res, 200, true, result.data, result.message);
    } catch (error) {
        console.error(`Error in [${FORGOT_PASSWORD.path}]:`, error);
        next(error); // Pass the error to the global error handler
    }
};

module.exports = {
    path: FORGOT_PASSWORD.path,
    method: FORGOT_PASSWORD.method,
    handler: forgotPasswordHandler,
};
