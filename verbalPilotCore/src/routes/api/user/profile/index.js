const sendResponse = require('../../../../utils/responseHandler');
const handleProfile = require('./controller.profile');
const authMiddleware = require('../../../../utils/authMiddleware');
const { PROFILE } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const profileHandler = async (req, res, next) => {
    const context = {
        userId: req.user?.id,
        email: req.user?.email,
        path: PROFILE.path,
        method: PROFILE.method
    };

    try {
        logger.info('Profile request received', { ...context });

        const { id: userId } = req.user;
        const result = await handleProfile(userId);

        if (result.Error) {
            logger.warn('Profile request failed', {
                ...context,
                error: result.message
            });
            return sendResponse(res, 400, false, null, result.message);
        }

        logger.info('Profile request successful', { ...context });
        sendResponse(res, 200, true, result.data, result.message);
    } catch (error) {
        logger.error('Unexpected error in profile route', {
            ...context,
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = {
    path: PROFILE.path,
    method: PROFILE.method,
    handler: profileHandler,
    middleware: [authMiddleware]
};
