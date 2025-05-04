const User = require('../../sequelizeSchemas/user');

const handleProfile = async (id) => {
    try {
        // Check if the email already exists
        const existingUser = await User.findOne({
            where: { id },
            attributes: [
            ['id', 'id'],
            ['email', 'email'],
            ['gender', 'gender'],
            ['dateofbirth', 'dateOfBirth'],
            ['firstname', 'firstName'],
            ['lastname', 'lastName'],
            ['isverified', 'isVerified'],
            ['isdeleted', 'isDeleted']
            ] // Specify only the needed keys with camel case aliases
        });

        if(!existingUser) {
            return { profileError: true, message: 'User not found' };
        }

        return { profileError: false,  message: 'User profile fetched successfully', data: existingUser };
    } catch (error) {
        console.error('Error during profile:', error);
        return { signUpError: true, message: 'Internal server error' };
    }
};

module.exports = handleProfile;
