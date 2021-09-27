const jwt = require('jsonwebtoken');
const sfController = require('./sfController');
const Document = require('../models/doucmentModel');

exports.uploadDocument = async (req, res) => {
  const documentData = req.body;

  const {
    uuid,
    accountId,
    s3Url,
    key,
    documentName,
    documentType,
    documentGroup,
    documentStatus,
    rejectionReason,
    country,
  } = req.body;

  const document = new Document({
    uuid,
    accountId,
    s3Url,
    key,
    documentName,
    documentType,
    documentGroup,
    documentStatus,
    rejectionReason,
    country,
  });

  if (await Document.exists({ accountId, documentGroup })) {
    Document.findOneAndRemove({
      accountId,
      documentGroup,
    },
    (err) => {
      if (err) {
        res.send(err);
      }
    });
  }

  document.save((err) => {
    if (err) {
      if (err.code === 11000) {
        res.status(409)
          .json('This document already exists');
      } else {
        res.status(500)
          .json('Error uploading document, please try again.');
      }
    } else {
      sfController.uploadDocument(documentData);
      res.status(200).send();
    }
  });
};

exports.updateDocument = async (req, res) => {
  if (await Document.exists({ uuid: req.body.uuid })) {
    jwt.verify(req.body.token, process.env.USER_SECRET, (err) => {
      if (err) {
        res.status(401).send('Unathorized: Invalid token');
      } else {
        Document.findOneAndUpdate({
          uuid: req.body.uuid,
        }, req.body.updateData, { new: true }, (error, result) => {
          if (error) {
            res.status(error.code).send(error);
          } else {
            res.status(200).send(result);
          }
        });
      }
    });
  } else {
    res.status(404).send('Document not found');
  }
};

exports.getDocumentsByUserId = async (req, res) => {
  const { accountId } = req.query;

  Document.find({
    accountId,
  }, (error, documents) => {
    res.status(200).send(documents);
  });
};

exports.createDocument = async (req, res) => {
  const {
    uuid,
    accountId,
    s3Url,
    key,
    documentName,
    documentType,
    documentGroup,
    documentStatus,
    rejectionReason,
    country,
  } = req.body;

  const document = new Document({
    uuid,
    accountId,
    s3Url,
    key,
    documentName,
    documentType,
    documentGroup,
    documentStatus,
    rejectionReason,
    country,
  });

  jwt.verify(req.body.token, process.env.USER_SECRET, async (err) => {
    if (err) {
      res.status(401).send('Unathorized: Invalid token');
    } else {
      if (await Document.exists({ accountId, documentGroup })) {
        Document.findOneAndRemove({
          accountId,
          documentGroup,
        },
        (errorr) => {
          if (errorr) {
            res.send(errorr);
          }
        });
      }
      document.save((error) => {
        if (error) {
          if (error.code === 11000) {
            res.status(409)
              .json('This document already exists');
          } else {
            res.status(500)
              .json(error);
          }
        } else {
          res.status(200).send();
        }
      });
    }
  });
};
