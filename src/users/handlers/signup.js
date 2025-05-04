const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../sequelizeSchemas/user');
const { SALT_ROUNDS, JWT_SECRET, JWT_EXPIRY } = process.env;
const sendEmail = require('../../utils/email/emailSender');

const handleSignup = async ({
    firstname,
    lastname,
    email,
    password,
    gender,
    dateofbirth,
}) => {
    try {
        // Check if the email already exists
        const existingUser = await User.findOne({
            where: { email },
        });

        if (existingUser) {
            return { signUpError: true, message: 'Email already exists' };
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, parseInt(SALT_ROUNDS));

        // Create a new user
        const newUser = await User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            gender,
            dateofbirth,
        });

        // Optionally, you can send a verification email here
        // Generate a random verification code
        const verificationcode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save the verification code to the user's record (assuming a verificationCode field exists)
        await newUser.update({ verificationcode });

        console.log(`Verification code for ${email}: ${verificationcode}`);

        sendEmail({
            to: email,
            subject: 'Thank you for signing up!',
            template: 'verificationEmail.ejs',
            templateData: {
                name: `${firstname} ${lastname}`,
                verificationcode,
            },
        }).then((response) => {
            console.log(response);
        });

        // Generate JWT token
        const token = jwt.sign({ id: newUser.id, isverified: false, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

        return { signUpError: false, token, message: 'User created successfully' };
    } catch (error) {
        console.error('Error during signup:', error);
        return { signUpError: true, message: 'Internal server error' };
    }
};

module.exports = handleSignup;
