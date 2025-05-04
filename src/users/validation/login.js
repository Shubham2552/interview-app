const Joi = require('joi');
const sendResponse = require('../../utils/responseHandler');

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required',
    })
});

const validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return sendResponse(res, 400, false, null,  { errors: error.details.map(err => err.message) });
    }
    next();
};

module.exports = {
    validateLogin,
};