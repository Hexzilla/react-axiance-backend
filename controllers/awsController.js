const AWS = require('aws-sdk');
const fs = require('fs');
const FileType = require('file-type');
const multiparty = require('multiparty');

AWS.config.update({ region: 'eu-west-1' });

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'eu-west-1',
});

const s3 = new AWS.S3();

const uploadFile = (buffer, name, type) => {
  const params = {
    Body: buffer,
    Bucket: process.env.S3_BUCKET,
    ContentType: type.mime,
    Key: `${name}.${type.ext}`,
  };
  return s3.upload(params).promise();
};

exports.uploadDocuments = (request, response) => {
  const form = new multiparty.Form();
  form.parse(request, async (error, fields, files) => {
    if (error) {
      return response.status(500).send(error);
    }
    try {
      const { path } = files.file[0];
      const buffer = fs.readFileSync(path);
      const type = await FileType.fromBuffer(buffer);
      const fileName = `bucketFolder/${Date.now().toString()}`;
      const data = await uploadFile(buffer, fileName, type);
      return response.status(200).send(data);
    } catch (err) {
      return response.status(500).send(err);
    }
  });
};

exports.listObjects = (req, res) => {
  s3.listObjects({
    Bucket: process.env.S3_BUCKET,
  }, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};
