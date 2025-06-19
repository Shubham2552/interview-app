const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SALT_ROUNDS, JWT_SECRET, JWT_EXPIRY } = process.env;
const { User, UserToken } = require('../../../../../../models');
const { updateEmailVerification } = require('../../../../../commonServices/users/sendEmailVerificationCode');
const {responseMessages, tokenType, EMAIL_TEMPLATES } = require('../../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../../utils/logger');
const { logError } = require('../../../../../utils/errorLogger');

const handleSignup = async ({
    firstName,
    lastName,
    email,
    password,
    gender,
    dateOfBirth,
    phone,
    deviceInfo,
    ipAddress,
}) => {
    const context = { email, ipAddress };

    try {
        logger.info('Starting user signup process', { ...context });

        // Check if the email already exists
        const existingUser = await User.findOne({
            where: { 
                email,
                isDeleted: false 
            },
        });

        if (existingUser) {
            logger.warn('Signup failed: Email already exists', { ...context });
            return { Error: true, message: responseMessages.SUCCESS_CONSTANTS.EMAIL_ALREADY_EXISTS };
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, parseInt(SALT_ROUNDS));

        // Create a new user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            gender,
            dateOfBirth,
            phone,
        });

        logger.info('User created successfully', { 
            ...context, 
            userId: user.id 
        });

        await updateEmailVerification(user, EMAIL_TEMPLATES.keys.SIGNUP);
        logger.info('Email verification sent', { 
            ...context, 
            userId: user.id 
        });

        // Parse JWT_EXPIRY to get seconds
        const expirySeconds = parseInt(JWT_EXPIRY) || 86400; // Default to 24 hours if parsing fails

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                isVerified: false, 
                email 
            }, 
            JWT_SECRET, 
            { 
                expiresIn: JWT_EXPIRY 
            }
        );
        
        // Calculate expiry date
        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + expirySeconds);

        // Insert token into user_tokens table
        await UserToken.create({
            userId: user.id,
            token,
            jwtExpiry: expiryDate,
            tokenType: tokenType.ACCESS,
            deviceInfo,
            ipAddress
        });

        logger.info('Signup completed successfully', { 
            ...context, 
            userId: user.id 
        });

        return { 
            Error: false, 
            token, 
            userId: user.id,
            message: responseMessages.SUCCESS_CONSTANTS.USER_CREATED 
        };
    } catch (error) {
        logError(error, __filename, context);
        throw error;
    }
};

module.exports = handleSignup;
