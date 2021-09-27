const express = require('express');

const router = express.Router();
const awsController = require('../controllers/awsController');

router.post('/upload-documents', awsController.uploadDocuments);

router.get('/list-objects', awsController.listObjects);

module.exports = router;
