const Joi = require('joi');
const sendResponse = require('../../../../../utils/responseHandler');

const waitlistSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        })
});

const validateWaitlist = (req, res, next) => {
    const { error } = waitlistSchema.validate(req.query);
    
    if (error) {
        return sendResponse(res, 400, false, null, error.details[0].message);
    }

    next();
};

module.exports = { validateWaitlist };

 