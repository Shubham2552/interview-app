const express = require('express');
const sendResponse = require('../utils/responseHandler');
const handleSignup = require('../users/handlers/signup');
const {  validateLogin } = require('../users/validation/signup');
const router = express.Router();

router.post('/signup', async (req, res, next) => {
    try {
        const { 
            firstname,
            lastname,
            email,
            password,
            gender,
            dateofbirth } = req.body;

        // Validate required fields
            
        const result = await handleSignup({
            firstname,
            lastname,
            email,
            password,
            gender,
            dateofbirth,
        });
        if (result.signUpError) {
            return sendResponse(res, 400, false, null, result.message);
        }
        sendResponse(res, 200, true, { token: result.token }, result.message);
    } catch (error) {
        next(error); // Pass the error to the global error handler
    }
});

module.exports = { path: '/users', router, middleware: [validateLogin] };