const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/responseHandler'); // Adjust the path as needed

const authMiddleware = (req, res, next) => {
    const token = req.header('authorization')?.replace('Bearer ', '');

    if (!token) {
        return sendResponse(res, 401, false, 'Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded); // Log the decoded token for debugging
        req.user = decoded;
        next();
    } catch (err) {
        sendResponse(res, 400, false, 'Invalid token.');
    }
};

module.exports = authMiddleware;