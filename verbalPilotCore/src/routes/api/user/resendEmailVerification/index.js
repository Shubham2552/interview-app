const sendResponse = require('../../../../utils/responseHandler');
const handleResendEmailVerification = require('./controller.resendEmailVerification');
const authMiddleware = require('../../../../utils/authMiddleware');
const { RESEND_EMAIL_VERIFICATION } = require('../../../../constant/pathConstants');

const resendEmailVerificationHandler = async (req, res, next) => {
    try {
        console.log('Request User:', req.user); // Log the user object for debugging
        const { id } = req.user; // Assuming userId is passed as a route parameter
        // Fetch or update the user profile
        const result = await handleResendEmailVerification(id);

        if (result.E) {
            return sendResponse(res, 400, false, null, result.message);
        }
        sendResponse(res, 200, true, result.data, result.message);
    } catch (error) {
        next(error); // Pass the error to the global error handler
    }
};

module.exports = { 
    path: RESEND_EMAIL_VERIFICATION.path, 
    method: RESEND_EMAIL_VERIFICATION.method, 
    handler: resendEmailVerificationHandler, 
    middleware: [authMiddleware] 
};
