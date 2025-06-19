const jwt = require('jsonwebtoken');
const { JWT_EXPIRY, FRONTEND_URL } = process.env;
const { User, UserToken } = require('../../../../../../models');
const { responseMessages, tokenType, EMAIL_TEMPLATES } = require('../../../../../constant/genericConstants/commonConstant');
const { sendForgotPasswordEmail } = require('../../../../../commonServices/users/forgotPasswordEmail');
const logger = require('../../../../../utils/logger');
const { logError } = require('../../../../../utils/errorLogger');

const handleForgotPassword = async ({email, ipAddress, deviceInfo}) => {
    const context = { email, ipAddress };

    try {
        logger.info('Starting forgot password process', { ...context });

        const user = await User.findOne({ where: { email } });
        if (!user) {
            logger.warn('Forgot password failed: User not found', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.USER_NOT_FOUND };
        }

        context.userId = user.id;

        // Generate a jwt token for password reset
        const resetToken = jwt.sign(
            { id: user.id, email: user.email, isVerified: user.isVerified },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        logger.info('Reset token generated', { ...context });

        // Put this token in the usertokens table
        await UserToken.create({
            userId: user.id,
            token: resetToken,
            jwtExpiry: new Date(Date.now() + (jwt.decode(resetToken).exp - jwt.decode(resetToken).iat) * 1000), // Calculate expiry from token
            isRevoked: false,
            deviceInfo: deviceInfo,
            ipAddress: ipAddress,
            tokenType: tokenType.RESET_PASSWORD
        });

        logger.info('Reset token stored in database', { ...context });

        // Send email
        const result = await sendForgotPasswordEmail({
            user,
            resetLink: `${FRONTEND_URL}/reset-password?token=${resetToken}`,
            type: EMAIL_TEMPLATES.keys.RESET_PASSWORD
        });

        logger.info('Reset password email sent successfully', { ...context });
        return result;

    } catch (error) {
        logError(error, __filename, context);
        return { Error: true, message: responseMessages.ERROR_CONSTANTS.INTERNAL_SERVER_ERROR };
    }
};

module.exports = handleForgotPassword;