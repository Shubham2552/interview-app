const Joi = require('joi');
const sendResponse = require('../../../../utils/responseHandler');

const updateProfileSchema = Joi.object({
    firstName: Joi.string().required().messages({
        'string.base': 'Firstname must be a string',
        'any.required': 'Firstname is required',
    }),
    lastName: Joi.string().required().messages({
        'string.base': 'Lastname must be a string',
        'any.required': 'Lastname is required',
    }),
    phone: Joi.string().pattern(/^[0-9]+$/).length(10).required().messages({
        'string.pattern.base': 'Phone number must contain only digits',
        'any.required': 'Phone number is required',
        'string.length': 'Phone number must be 10 digits long',
    }),
    gender: Joi.string().valid('male', 'female', 'other').required().messages({
        'any.only': 'Gender must be male, female, or other',
        'any.required': 'Gender is required',
    }),
    dateOfBirth: Joi.date().iso().required().messages({
        'date.format': 'Date of birth must be a valid date in ISO 8601 format',
        'any.required': 'Date of birth is required',
    }),
});

const validateUpdateProfile = (req, res, next) => {
    const { error } = updateProfileSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return sendResponse(res, 400,false, null,  error.details.map(err => err.message) );
    }
    next();
};

module.exports = {
    validateUpdateProfile,
};