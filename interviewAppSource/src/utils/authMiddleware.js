const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/responseHandler'); // Adjust the path as needed
const { UserToken } = require('../models/index'); // Adjust the path as needed
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

const authMiddleware = async (req, res, next) => {
    const context = {
        path: req.path,
        method: req.method,
        ip: req.ip
    };

    logger.debug('Processing authentication middleware', { ...context });
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        logger.warn('No authentication token provided', { ...context });
        return sendResponse(res, 401, false, 'Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        context.userId = decoded.id;
        context.email = decoded.email;

        const tokenData = await UserToken.findOne({
            where: {
                token: token,
                userId: decoded.id,
                isRevoked: false
            }
        });

        console.log('Token Data:', tokenData);
        // Check if the token exists and is not revoked
        if (!tokenData) {
            logger.warn('Invalid or revoked token', { ...context });
            return sendResponse(res, 403, false, null, 'Token is invalid or has been revoked.');
        }

        logger.info('Authentication successful', { ...context });
        req.user = decoded;

        next();
    } catch (err) {
        logger.error('Authentication failed', {
            ...context,
            error: err.message,
            stack: err.stack
        });
        sendResponse(res, 403, false, null, 'Invalid token.');
    }
};

module.exports = authMiddleware;