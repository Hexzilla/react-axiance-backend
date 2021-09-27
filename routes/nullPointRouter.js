const express = require('express');

const router = express.Router();
const nullPointController = require('../controllers/nullPointController');

router.post('/generate', nullPointController.generateUrl);

router.get('/user-details', nullPointController.getUserDetails);

module.exports = router;
