const express = require('express');
const sendResponse = require('../utils/responseHandler');
const router = express.Router();

router.get('/', (req, res) => {
    sendResponse(res, 200, true, null, 'Welcome to the API!');
});

module.exports = { path: '/', router };