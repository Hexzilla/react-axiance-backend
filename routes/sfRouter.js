const express = require('express');

const router = express.Router();
const sfController = require('../controllers/sfController');

router.post('/token', sfController.getToken);

router.post('/resend-code', sfController.resendCode);

module.exports = router;
