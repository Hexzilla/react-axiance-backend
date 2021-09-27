const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);

router.get('/get-user', userController.getUserByID);

router.post('/login', userController.loginUser);

router.get('/authenticate', userController.authenticateUser);

router.post('/change-password', userController.changePassword);

router.put('/update', userController.updateUser);

router.put('/update-pass', userController.updateUserPass);

router.put('/sf-pass-update', userController.sfUpdatePass);

router.get('/get-token', userController.getToken);

router.post('/confirm-email', userController.confirmEmail);

router.post('/confirm-email-password', userController.confirmEmailPassword);

router.post('/reset-password-code', userController.resetPassword);

router.put('/update-socials', userController.updateSocials);

router.post('/support', userController.support);

router.post('/create', userController.createUser);

module.exports = router;
