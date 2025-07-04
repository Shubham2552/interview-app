const Joi = require('joi');
const sendResponse = require('../../../../../utils/responseHandler');

const surveySchema = Joi.object({
    surveyEmail: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    roles: Joi.string()
        .required()
        .messages({
            'any.required': 'Roles selection is required'
        }),
    jobHunting: Joi.string()
        .required()
        .messages({
            'any.only': 'Invalid job hunting status',
            'any.required': 'Job hunting status is required'
        }),
    challenges: Joi.string()
        .required()
        .messages({
            'array.min': 'Please select at least one challenge',
            'any.required': 'Challenges selection is required'
        }),
    willPay: Joi.string()
        .required()
        .messages({
            'any.required': 'Payment willingness indication is required'
        }),
    featureSuggestion: Joi.string()
        .allow('')
        .optional(),
});

const validateSurvey = (req, res, next) => {
    const { error } = surveySchema.validate(req.body);
    
    if (error) {
        return sendResponse(res, 400, false, null, error.details[0].message);
    }

    next();
};

module.exports = { validateSurvey, surveySchema }; 