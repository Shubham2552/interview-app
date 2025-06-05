module.exports = [
    ['SIGN_UP', '/signup', 'post'],
    ['LOGIN', '/login', 'post'],
    ['PROFILE', '/profile', 'get'],
    ['UPDATE_PROFILE', '/profile', 'put'],
    ['CHANGE_PASSWORD', '/change-password', 'post'],
    ['VERIFY_EMAIL', '/verify-email', 'get'],
    ['RESEND_EMAIL_VERIFICATION', '/resend-email-verification-code', 'get'],
    ['FORGOT_PASSWORD', '/forgot-password', 'get'],
    ['RESET_PASSWORD', '/reset-password', 'post'],
    ['LOGOUT', '/logout', 'get'],
].reduce((acc, ele) => {
    acc[ele[0]] = {
        path: ele[1],
        method: ele[2]
    };
    return acc;
}, {});