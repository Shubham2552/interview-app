const bcrypt = require('bcrypt');
const { updatePassword } = require('../../../../../commonServices/users/updatePassword');
const { User, UserToken } = require('../../../../../../models');
const { responseMessages } = require('../../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../../utils/logger');
const { logError } = require('../../../../../utils/errorLogger');

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

        const user = await User.findOne({ 
            where: { 
                id: userId,
                isDeleted: false
            } 
        });
        
        if (!user) {
            logger.warn('Password change failed: User not found', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.USER_NOT_FOUND };
        }

        context.email = user.email;

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            logger.warn('Password change failed: Old password mismatch', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.OLD_PASSWORD_MISMATCH };
        }

        await updatePassword(user, newPassword);
        logger.info('Password updated successfully', { ...context });
    
        await UserToken.update(
            { isRevoked: true },
            { where: { userId: user.id, isRevoked: false } }
        );
        logger.info('All existing tokens revoked', { ...context });

        return { Error: false, message: responseMessages.SUCCESS_CONSTANTS.PASSWORD_CHANGED_SUCCESSFULLY };
    } catch (error) {
        logError(error, __filename, context);
        throw error; // Let the global error handler handle it
    }
};

module.exports = handleChangePassword;