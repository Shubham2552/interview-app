const path = require('path');
const { User } = require('../../../../../models');
const { responseMessages } = require('../../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../../utils/logger');
const { logError } = require('../../../../../utils/errorLogger');

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

        // Update the user profile
        const [updatedRowsCount] = await User.update(
            {
                firstName,
                lastName,
                gender,
                dateOfBirth,
                phone,
            },
            {
                where: { 
                    id: userId,
                    isDeleted: false
                }
            }
        );

        if (updatedRowsCount === 0) {
            logger.warn('Profile update failed: User not found', { ...context });
            return { Error: true, message: responseMessages.ERROR_CONSTANTS.USER_NOT_FOUND };
        }

        // Fetch the updated user
        const updatedUser = await User.findOne({
            where: { 
                id: userId,
                isDeleted: false
            },
            attributes: [
                'id',
                'email',
                'gender',
                'dateOfBirth',
                'firstName',
                'lastName',
                'isVerified',
                'phone',
                'createdAt',
                'updatedAt'
            ]
        });

        logger.info('Profile updated successfully', { 
            ...context,
            email: updatedUser.email
        });

        return { 
            Error: false, 
            message: responseMessages.SUCCESS_CONSTANTS.PROFILE_UPDATED_SUCCESSFULLY, 
            data: updatedUser 
        };
    } catch (error) {
        logError(error, __filename, context);
        throw error; // Let the global error handler handle it
    }
};

module.exports = handleUpdateProfile;
