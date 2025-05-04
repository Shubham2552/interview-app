const sendResponse = require('../../../utils/responseHandler');
const handleLogin = require('../../../users/handlers/login');
const { validateLogin } = require('../../../users/validation/login');

const loginHandler =  async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await handleLogin({ email, password });
        if (result.loginError) {
            return sendResponse(res, 400, false, null, result.message);
        }
        sendResponse(res, 200, true, { token: result.token }, result.message);
    } catch (error) {
        next(error); // Pass the error to the global error handler
    }
};

module.exports = { path: '/login',method: 'post', handler: loginHandler , middleware: [validateLogin] };
