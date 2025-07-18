const Joi = require('joi');

const signupSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required().messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
    }),
    gender: Joi.string().valid('male', 'female', 'other').required().messages({
        'any.only': 'Gender must be male, female, or other',
        'any.required': 'Gender is required'
    }),
    dateOfBirth: Joi.date().max('now').required().messages({
        'date.max': 'Date of birth cannot be in the future',
        'any.required': 'Date of birth is required'
    }),
    phone: Joi.string().optional().allow('', null)
});

const validateSignup = (req, res, next) => {
    const { error } = signupSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    
    next();
};

module.exports = validateSignup; 