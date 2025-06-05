const path = require('path');
const logger = require('./logger');

const logError = (error, fileName, additionalInfo = {}) => {
    const relativeFilePath = path.relative(process.cwd(), fileName).replace(/\\/g, '/');
    
    logger.error('Error occurred', {
        file: relativeFilePath,
        error: {
            message: error.message,
            stack: error.stack,
            ...additionalInfo
        }
    });
};

module.exports = {
    logError
}; 