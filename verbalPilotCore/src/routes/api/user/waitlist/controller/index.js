// const { PreRegisterUser } = require('../../../../../../models'); // Sequelize removed
const logger = require('../../../../../utils/logger');
const { responseMessages, EMAIL_TEMPLATES } = require('../../../../../constant/genericConstants/commonConstant');
const { sendGenericEmail } = require('../../../../../commonServices/users/genericEmailSender');

const handleWaitlist = async ({ email, ipAddress, deviceInfo, name }) => {
    // Waitlist logic temporarily disabled (Sequelize removed)
    return {
        Error: true,
        message: 'Waitlist temporarily unavailable: migration in progress.',
        data: null
    };
};

module.exports = handleWaitlist;