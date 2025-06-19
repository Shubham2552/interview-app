const sendResponse = require('../../../../utils/responseHandler');
const handleWaitlist = require('./controller');
const { validateWaitlist } = require('./validation');
const { WAITLIST } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const waitlistHandler = async (req, res, next) => {
    const context = {
        email: req.query.email,
        ipAddress: req.clientIp || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
    };

    try {
        logger.info('Waitlist request received', {
            ...context,
            path: WAITLIST.path,
            method: WAITLIST.method
        });
            
        const result = await handleWaitlist({
            ...req.query,
            deviceInfo: context.userAgent,
            ipAddress: context.ipAddress,
        });

        if (result.Error) {
            logger.warn('Waitlist request failed', {
                ...context,
                error: result.message
            });
            return sendResponse(res, 400, false, null, result.message);
        }

        logger.info('Waitlist request successful', {
            ...context,
            userId: result.userId
        });

        sendResponse(res, 200, true, { userId: result.userId }, result.message);
    } catch (error) {
        logger.error('Unexpected error in waitlist route', {
            ...context,
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = { 
    path: WAITLIST.path,
    method: WAITLIST.method,
    handler: waitlistHandler, 
    middleware: [validateWaitlist] 
}; 