const Joi = require('joi');

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
    })
});

const validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    
    next();
};

module.exports = validateLogin; 