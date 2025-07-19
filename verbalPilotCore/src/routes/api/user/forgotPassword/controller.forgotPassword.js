const jwt = require('jsonwebtoken');
const { JWT_EXPIRY, FRONTEND_URL } = process.env;
const { responseMessages, tokenType, EMAIL_TEMPLATES } = require('../../../../constant/genericConstants/commonConstant');
const { sendForgotPasswordEmail } = require('../../../../commonServices/users/forgotPasswordEmail');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');
const { getUserForPasswordResetByEmail, insertUserToken } = require('../../../../../models/queries/query.user');

const handleForgotPassword = async ({email, ipAddress, deviceInfo}) => {
    const context = { email, ipAddress };

    try {
        logger.info('Starting forgot password process', { ...context });

        // Fetch user by email using the new query
        const user = await getUserForPasswordResetByEmail(email);
        if (!user) {
            logger.warn('Forgot password failed: User not found', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.USER_NOT_FOUND };
        }

        context.userId = user.id;

        // Generate a jwt token for password reset
        const resetToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        logger.info('Reset token generated', { ...context });

        // Calculate expiry from token
        const decoded = jwt.decode(resetToken);
        const jwtExpiry = new Date(Date.now() + (decoded.exp - decoded.iat) * 1000);

        // Insert this token in the user_tokens table using query
        await insertUserToken({
            userId: user.id,
            token: resetToken,
            jwtExpiry,
            tokenType: tokenType.RESET_PASSWORD,
            deviceInfo,
            ipAddress
        });

        logger.info('Reset token stored in database', { ...context });

        // Send email
        const result = await sendForgotPasswordEmail({
            email: user.email,
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