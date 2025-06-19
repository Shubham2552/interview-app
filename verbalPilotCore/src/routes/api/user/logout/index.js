const sendResponse = require('../../../../utils/responseHandler');
const authMiddleware = require('../../../../utils/authMiddleware');
const { handleLogout } = require('./controller');
const { LOGOUT } = require('../../../../constant/pathConstants');

const logoutHandler = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        const result = await handleLogout({ token, userId: req.user.id });

        if (result.Error) {
            return sendResponse(res, 400, false, null, result.message);
        }
        sendResponse(res, 200, true, null, result.message);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    path: LOGOUT.path,
    method: LOGOUT.method,
    handler: logoutHandler,
    middleware: [authMiddleware]
};