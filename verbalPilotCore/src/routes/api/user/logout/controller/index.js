const { UserTokens } = require('../../../../../../models');
const { responseMessages } = require('../../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../../utils/logger');
const { logError } = require('../../../../../utils/errorLogger');

const handleLogout = async ({ token, userId }) => {
    const context = { userId };

    try {
        logger.info('Starting logout process', { ...context });

        if (!token) {
            logger.warn('Logout failed: No token provided', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.NO_TOKEN_PROVIDED };
        }

        const [updatedCount] = await UserTokens.update(
            { isRevoked: true },
            {
                where: {
                    token,
                    userId,
                    isRevoked: false
                }
            }
        );

        if (updatedCount === 0) {
            logger.warn('Logout failed: Token invalid or already revoked', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.TOKEN_INVALID_OR_REVOKED };
        }

        logger.info('User logged out successfully', { ...context });
        return { Error: false, message: responseMessages.SUCCESS_CONSTANTS.LOGOUT_SUCCESSFUL };
    } catch (error) {
        logError(error, __filename, context);
        throw error; // Let the global error handler handle it
    }
};

module.exports = handleLogout;