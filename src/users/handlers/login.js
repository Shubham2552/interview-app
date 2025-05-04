const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../sequelizeSchemas/user');
const { SALT_ROUNDS } = process.env;
const sendEmail = require('../../utils/email/emailSender');
const { JWT_SECRET } = process.env;
const { JWT_EXPIRY } = process.env;
const handleLogin = async ({email, password}) => {

    try {
        // Check if the user exists
  // Check if the email already exists
        const existingUser = await User.findOne({
            where: { email },
        });

        if (!existingUser) {
            return { loginError: true, message: 'Email not found!' };
        }
      

        // Compare the password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordValid) {
            return { loginError: true, message: 'Invalid password!' };
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
            id: existingUser.id, 
            email: existingUser.email, 
            isverified: existingUser.isverified 
        }, 
            process.env.JWT_SECRET, 
            {
            expiresIn: JWT_EXPIRY,
        });

        return {
            loginError: false,
            message: 'Login successful!',
            token,
        };

    } catch (error) {
        console.error('Error during login:', error);
        return { loginError: true, message: 'An error occurred during login!' };
    }
};


module.exports = handleLogin;