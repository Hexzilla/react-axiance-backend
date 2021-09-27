const express = require('express');

const router = express.Router();
const documentController = require('../controllers/documentController');

router.post('/upload', documentController.uploadDocument);

router.put('/update', documentController.updateDocument);

router.get('/get-docs', documentController.getDocumentsByUserId);

router.post('/create', documentController.createDocument);

module.exports = router;
