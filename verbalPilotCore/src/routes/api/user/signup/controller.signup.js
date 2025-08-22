const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SALT_ROUNDS, JWT_SECRET, JWT_EXPIRY } = process.env;
const { getUserByEmail, createUserWithMetaAndToken } = require('../../../../../models/queries/query.user');
const { updateEmailVerification } = require('../../../../commonServices/users/sendEmailVerificationCode');
const {responseMessages, EMAIL_TEMPLATES } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');

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
        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            logger.warn('Signup failed: Email already exists', { ...context });
            return { Error: true, message: responseMessages.SUCCESS_CONSTANTS.EMAIL_ALREADY_EXISTS };
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, parseInt(SALT_ROUNDS));

        // Parse JWT_EXPIRY to get seconds
        const expirySeconds = parseInt(JWT_EXPIRY) || 86400;
        
        // Calculate expiry date
        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + expirySeconds);

        // Create user, user_meta, and token in a single transaction
        const { user, token} = await createUserWithMetaAndToken({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            gender,
            dateOfBirth,
            phone,
            jwtExpiry: expiryDate,
            deviceInfo,
            ipAddress
        });

        logger.info('User created successfully with meta and token', { 
            ...context, 
            userId: user.id 
        });

        await updateEmailVerification(user, EMAIL_TEMPLATES.keys.SIGNUP);
        logger.info('Email verification sent', { 
            ...context, 
            userId: user.id 
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