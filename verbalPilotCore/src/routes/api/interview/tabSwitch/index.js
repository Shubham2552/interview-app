const sendResponse = require('../../../../utils/responseHandler');
const handleTabSwitch = require('./controller.tabSwitch');
const { TAB_SWITCHES } = require('../../../../constant/pathConstants');
const logger = require('../../../../utils/logger');

const tabSwitchHandler = async (req, res, next) => {
    const userInterviewId = req.params.id;
    const userId = req.user.id;
    

    try {
        logger.info('Tab Switch Starting...', { userInterviewId, userId});
        const result = await handleTabSwitch({ userInterviewId, userId });
        if (result.Error) {
            logger.warn('Tab Switch Error...', { userId, userInterviewId, error: result.message });
            return sendResponse(res, result.status, false, null, result.message);
        }
        logger.info('Tab Switch Success...', { userId, userInterviewId});
        sendResponse(res, 200, true, result.data, result.message);
    } catch (error) {
        logger.error('Unexpected error in submit response route', {
            userInterviewId,
            userId,
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

module.exports = {
    path: TAB_SWITCHES.path,
    method: TAB_SWITCHES.method,
    handler: tabSwitchHandler,
    auth: true
}; 