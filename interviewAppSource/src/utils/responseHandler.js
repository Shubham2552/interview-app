const sendResponse = (res, statusCode, success, data = null, message = '') => {
    res.status(statusCode).json({
        success,
        message,
        data,
    });
};

module.exports = sendResponse;