const brypt = require('bcrypt');
const { SALT_ROUNDS } = process.env;
const { User, UserTokens } = require('../../../../../../models');
const { responseMessages } = require('../../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../../utils/logger');
const { logError } = require('../../../../../utils/errorLogger');

const handleResetPassword = async (id, newPassword) => {
    const context = { userId: id };

    try { 
        logger.info('Starting password reset process', { ...context });

        const existingUser = await User.findOne({
            where: { 
                id,
                isDeleted: false 
            },
            attributes: ['id', 'email', 'isVerified', 'password']
        });

        if (!existingUser) {
            logger.warn('Password reset failed: User not found', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.USER_NOT_FOUND };
        }

        context.email = existingUser.email;

        const comparedPassword = await brypt.compare(newPassword, existingUser.password);

        if (comparedPassword) {
            logger.warn('Password reset failed: New password same as old password', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.OLD_NEW_PASSWORD_SAME };
        }

        const hashedPassword = await brypt.hash(newPassword, parseInt(SALT_ROUNDS));

        await User.update({ password: hashedPassword }, { where: { id } });
        logger.info('Password updated successfully', { ...context });

        await UserTokens.update({ isRevoked: true }, { where: { userId: id, isRevoked: false } });
        logger.info('All existing tokens revoked', { ...context });

        return { Error: false, message: responseMessages.SUCCESS_CONSTANTS.RESET_PASSWORD_SUCCESS };
    } catch (error) {
        logError(error, __filename, context);
        throw error; // Let the global error handler handle it
    }
}

module.exports = handleResetPassword;