const sendResponse = require('../../../../utils/responseHandler');
const handleUpdateProfile = require('./controller');
const authMiddleware = require('../../../../utils/authMiddleware');
const { validateUpdateProfile } = require('./validation');
const { UPDATE_PROFILE } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const profileHandler = async (req, res, next) => {
    const context = {
        userId: req.user?.id,
        email: req.user?.email,
        path: UPDATE_PROFILE.path,
        method: UPDATE_PROFILE.method,
        updateFields: Object.keys(req.body).join(',')
    };

    try {
        logger.info('Update profile request received', { ...context });

        const { id: userId } = req.user;
        const result = await handleUpdateProfile({userId, ...req.body});

        if (result.Error) {
            logger.warn('Update profile request failed', {
                ...context,
                error: result.message
            });
            return sendResponse(res, 400, false, null, result.message);
        }

        logger.info('Profile updated successfully', { ...context });
        sendResponse(res, 200, true, result.data, result.message);
    } catch (error) {
        logger.error('Unexpected error in update profile route', {
            ...context,
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = { 
    path: UPDATE_PROFILE.path,
    method: UPDATE_PROFILE.method,
    handler: profileHandler,
    middleware: [authMiddleware, validateUpdateProfile]
};
