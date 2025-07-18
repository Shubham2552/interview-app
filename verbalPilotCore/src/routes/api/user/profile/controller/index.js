const { getUserProfileById } = require('../../../../../../models/queries/query.user');
const { responseMessages } = require('../../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../../utils/logger');
const { logError } = require('../../../../../utils/errorLogger');

const handleProfile = async (id) => {
    const context = { userId: id };

    try {
        logger.info('Fetching user profile', { ...context });

        const existingUser = await getUserProfileById(id);

        if(!existingUser) {
            logger.warn('Profile fetch failed: User not found', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.USER_NOT_FOUND };
        }

        context.email = existingUser.email;
        logger.info('Profile fetched successfully', { ...context });

        return { 
            Error: false, 
            message: responseMessages.SUCCESS_CONSTANTS.GET_USER_PROFILE, 
            data: existingUser 
        };
    } catch (error) {
        logError(error, __filename, context);
        throw error; // Let the global error handler handle it
    }
};

module.exports = handleProfile;
