const successConstants = require('../successConstants/successConstants');
const errorConstants = require('../errorConstants/errorConstants');

exports.verificationCodeTypes = {
    SIGNUP: 'signup',
    RESEND: 'resend',
}

exports.tokenType = {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET_PASSWORD: 'reset_password',
}

exports.responseMessages = {
    SUCCESS_CONSTANTS: successConstants,
    ERROR_CONSTANTS: errorConstants,
}

exports.EMAIL_TEMPLATES = {
    keys: {
        SIGNUP: 'signup',
        RESEND: 'resend',
        RESET_PASSWORD: 'reset_password',
        WAITLIST: 'waitlist',
        PRE_REGISTRATION_SURVEY: 'pre_registration_survey'
    },
    signup: {
        templateName: 'verificationEmail.ejs',
        subject: 'Thank you for signing up!',
    },
    resend: {
        templateName: 'resendVerificationEmail.ejs',
        subject: 'Resend Email Verification Code',
    },
    reset_password: {
        templateName: 'resetPasswordEmail.ejs',
        subject: 'Reset Your Password',
    },
    waitlist: {
        templateName: 'waitlistEmail.ejs',
        subject: 'Thank You! You have successfully Pre-Registered'
    },
    pre_registration_survey: {
        templateName: 'preRegistrationSurvey.ejs',
        subject: 'Thanks! You request has a special place.'
    }
}