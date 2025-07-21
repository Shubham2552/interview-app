const jwt = require('jsonwebtoken');
const sendResponse = require('./responseHandler'); // Adjust the path as needed
const { getUserTokenByTokenAndUserId } = require('../../models/queries/query.user');
const { responseMessages } = require('../constant/genericConstants/commonConstant');
const logger = require('./logger');
/**
 * Middleware to authenticate requests using JWT.
 * It checks for the presence of a token in the Authorization header,
 * verifies it, and attaches the decoded user information to the request object.
 * If the token is missing or invalid, it sends an appropriate response.
 * Also validates the token's presence and correctness before proceeding to the next middleware.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */

const queryTokenMiddlware = async (req, res, next) => {
    const context = {
        path: req.path,
        method: req.method,
        ip: req.ip
    };

    logger.debug('Processing query token middleware', { ...context });
    const token = req.query.token;

    if (!token) {
        logger.warn('Token missing in query parameters', { ...context });
        return sendResponse(res, 400, false, null, 'Incorrect URL: Password reset failed.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        context.userId = decoded.id;

        const tokenData = await getUserTokenByTokenAndUserId(token, decoded.id);

        if (!tokenData) {
            logger.warn('Invalid or revoked token', { ...context });
            return sendResponse(res, 400, false, null, 'Incorrect URL: Password reset failed.');
        }

        logger.info('Token validated successfully', { ...context });
        req.user = decoded;
        next();
    } catch (err) {
        logger.error('Token verification failed', {
            ...context,
            error: err.message,
            stack: err.stack
        });
        sendResponse(res, 400, false, null, responseMessages.ERROR_CONSTANTS.INTERNAL_SERVER_ERROR);
    }
};

module.exports = queryTokenMiddlware;