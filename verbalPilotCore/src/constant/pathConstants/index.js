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
    ['WAITLIST', '/waitlist', 'get'],
    ['SURVEY', '/survey', 'post'],
    ['GET_AVAILAIBLE_INTERVIEWS', '/available-interviews', 'get'],
    ['GET_INTERVIEW_META_OBJECT', '/interview-meta/:id', 'get'],
    ['INITIATE_INTERVIEW', '/initiate-interview/:id', 'get'],
    ['START_INTERVIEW', '/start-interview', 'post'],
    ['GET_INTERVIEW_BY_STATUS', '/interview-by-status', 'get'],
    ['GET_INTERVIEW_QUESTION', '/question/:id', 'get'],
    ['SUBMIT_RESPONSE', '/submit-response/:id', 'post'],
    ['END_INTERVIEW', '/end-interview/:id', 'get'],
    ['TAB_SWITCHES', '/tab-switch/:id','get'],
    ['ASSESSMENT_ANSWERS', '/assessment-answers/:id', 'get'],
    ['INTEVIEW_DETAILS', '/details/:id', 'get'],
    ['GENERATE_ASSESSMENT_REPORT', '/assessment-report/:id','get'],
    ['ANSWER_ANALYSIS', '/answer-analysis/:questionid', 'get'],

    ['GET_USER_INTERVIEWS', '/user-interviews', 'get'],
    ['GET_USER_INTERVIEW_META', '/user-interview-meta/:id', 'get'],
].reduce((acc, ele) => {
    acc[ele[0]] = {
        path: ele[1],
        method: ele[2]
    };
    return acc;
}, {});