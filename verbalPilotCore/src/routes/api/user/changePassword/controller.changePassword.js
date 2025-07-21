const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = process.env;
const { getUserProfileById, getUserPasswordById, updateUserPasswordById, revokeUserTokens } = require('../../../../../models/queries/query.user');
const { responseMessages, tokenType } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');

/*
    Actions
    - Validate user exists
    - Validate old password matches
    - Update password with new password
    - Expire any existing sessions or tokens if necessary
*/
const handleChangePassword = async ({ userId, oldPassword, newPassword }) => {
    const context = { userId };

    try {
        logger.info('Starting password change process', { ...context });

        // Use query.user.js to get user profile
        const user = await getUserProfileById(userId);
        if (!user) {
            logger.warn('Password change failed: User not found', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.USER_NOT_FOUND };
        }

        context.email = user.email;

        // Get current hashed password
        const currentPassword = await getUserPasswordById(userId);
        if (!currentPassword) {
            logger.warn('Password change failed: User password not found', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.USER_NOT_FOUND };
        }

        const isMatch = await bcrypt.compare(oldPassword, currentPassword);
        if (!isMatch) {
            logger.warn('Password change failed: Old password mismatch', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.OLD_PASSWORD_MISMATCH };
        }

        // Check if new password is same as old password
        const isSame = await bcrypt.compare(newPassword, currentPassword);
        if (isSame) {
            logger.warn('Password change failed: New password same as old password', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.OLD_NEW_PASSWORD_SAME };
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, parseInt(SALT_ROUNDS));
        await updateUserPasswordById(userId, hashedPassword);
        logger.info('Password updated successfully', { ...context });

        // Revoke all tokens
        await revokeUserTokens(userId, tokenType.ACCESS);
        await revokeUserTokens(userId, tokenType.RESET_PASSWORD);
        logger.info('All existing tokens revoked', { ...context });

        return { Error: false, message: responseMessages.SUCCESS_CONSTANTS.PASSWORD_CHANGED_SUCCESSFULLY };
    } catch (error) {
        logError(error, __filename, context);
        throw error; // Let the global error handler handle it
    }
};

module.exports = handleChangePassword;