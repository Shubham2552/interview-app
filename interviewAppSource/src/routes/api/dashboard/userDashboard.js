const sendResponse = require('../../../utils/responseHandler');
const handleLogin = require('../../../modules/users/handlers/login');
const { validateLogin } = require('../../../modules/users/validation/login');

const loginHandler =  async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log('Login Request ipAddress and deviceInfo:', req.ip, req.headers['user-agent']); // Log the request body for debugging
        const result = await handleLogin({ 
            email, 
            password, 
            deviceInfo: req.headers['user-agent'] || 'unknown',
            ipAddress: req.ip || 'unknown',   
        });
        if (result.loginError) {
            return sendResponse(res, 400, false, null, result.message);
        }
        sendResponse(res, 200, true, { token: result.token }, result.message);
    } catch (error) {
        next(error); // Pass the error to the global error handler
    }
};

module.exports = { path: '/login',method: 'post', handler: loginHandler , middleware: [validateLogin] };
