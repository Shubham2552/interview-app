const sendResponse = require('../../../utils/responseHandler');
const handleProfile = require('../../../users/handlers/profile');
const authMiddleware = require('../../../utils/authMiddleware');
const profileHandler = async (req, res, next) => {
    try {
        console.log('Request User:', req.user); // Log the user object for debugging
        const { id: userId } = req.user; // Assuming userId is passed as a route parameter
        // Fetch or update the user profile
        const result = await handleProfile(userId);

        if (result.profileError) {
            return sendResponse(res, 400, false, null, result.message);
        }
        sendResponse(res, 200, true, result.data, result.message);
    } catch (error) {
        next(error); // Pass the error to the global error handler
    }
};

module.exports = { path: '/profile', method: 'get', handler: profileHandler, middleware: [authMiddleware] };
