const Joi = require('joi');

const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required()
});

const validateChangePassword = (req, res, next) => {
    const { error } = changePasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: { errors: error.details.map(d => d.message) },
            data: null
        });
    }
    next();
};

module.exports = validateChangePassword;