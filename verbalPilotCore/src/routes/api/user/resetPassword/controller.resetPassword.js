const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = process.env;
const { updateUserPasswordById, getUserProfileById, revokeUserTokens, getUserPasswordById } = require('../../../../../models/queries/query.user');
const { responseMessages, tokenType } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');

const handleResetPassword = async (id, newPassword) => {
    const context = { userId: id };

    try {
        logger.info('Starting password reset process', { ...context });

        // Use query.user.js to get user profile
        const existingUser = await getUserProfileById(id);

        if (!existingUser) {
            logger.warn('Password reset failed: User not found', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.USER_NOT_FOUND };
        }

        context.email = existingUser.email;

        // Fetch the user's hashed password using query.user.js
        const userPassword = await getUserPasswordById(id);
        if (userPassword) {

            const comparedPassword = await bcrypt.compare(newPassword, userPassword);

            if (comparedPassword) {
                logger.warn('Password reset failed: New password same as old password', { ...context });
                return { Error: true, message: responseMessages.ERROR_CONSTANTS.OLD_NEW_PASSWORD_SAME };
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, parseInt(SALT_ROUNDS));

        // Update password using direct query
        await updateUserPasswordById(id, hashedPassword);
        logger.info('Password updated successfully', { ...context });

        // Revoke all tokens using query.user.js
        await revokeUserTokens(id, tokenType.ACCESS);
        await revokeUserTokens(id, tokenType.RESET_PASSWORD);
        logger.info('All existing tokens revoked', { ...context });

        return { Error: false, message: responseMessages.SUCCESS_CONSTANTS.RESET_PASSWORD_SUCCESS };
    } catch (error) {
        logError(error, __filename, context);
        throw error; // Let the global error handler handle it
    }
}

module.exports = handleResetPassword;