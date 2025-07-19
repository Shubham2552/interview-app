const path = require('path');
const { responseMessages } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');
const { updateUserData } = require('../../../../../models/queries/query.user');

const handleUpdateProfile = async ({
    userId, 
    firstName,
    lastName,
    gender,
    dateOfBirth,
    phone,
}) => {
    const context = { userId };

    try {
        logger.info('Starting profile update process', { ...context });
        const updateUserResult = await updateUserData({
            firstName,
            lastName,
            gender,
            dateOfBirth,
            phone,
            userId
        })

   

        if (updateUserResult?.length === 0) {
            logger.warn('Profile update failed: User not found', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.USER_NOT_FOUND };
        }


        logger.info('Profile updated successfully', { 
            ...context,
            updateUser: updateUserResult
        });

        return { 
            Error: false, 
            message: responseMessages.SUCCESS_CONSTANTS.PROFILE_UPDATED_SUCCESSFULLY, 
            data: updateUserResult
        };
    } catch (error) {
        logError(error, __filename, context);
        throw error; // Let the global error handler handle it
    }
};

module.exports = handleUpdateProfile;
