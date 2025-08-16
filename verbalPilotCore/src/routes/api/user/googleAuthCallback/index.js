const sendResponse = require('../../../../utils/responseHandler');
const { GOOGLE_AUTH_CALLBACK } = require('../../../../constant/pathConstants');
const handleGoogleAuthCallback = require('./controller.googleAuthCallback');

const googleAuthCallbackHandler = async (req, res, next) => {
    try {
        console.log(`Received googleAuthCallbackHandler request!`);
        const result = await handleGoogleAuthCallback({credential: req.body.credential});
        console.log(`After googleAuthCallbackHandler:`, result);
        if (result.Error) {
            return sendResponse(res, result.status || 400, false, null, result.message);
        }
        return sendResponse(res, 200, true, result.data, 'Google Auth URL generated successfully');
    } catch (error) {
        console.error(`Error in [${GOOGLE_AUTH_CALLBACK.path}]:`, error);
        next(error); // Pass the error to the global error handler
    }
};

module.exports = {
    path: GOOGLE_AUTH_CALLBACK.path,
    method: GOOGLE_AUTH_CALLBACK.method,
    handler: googleAuthCallbackHandler,
};
