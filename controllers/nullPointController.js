const crypto = require('crypto');
const chalk = require('chalk');
const fetch = require('node-fetch');

exports.generateUrl = async (req, res) => {
  const hashRequest = (x) => crypto.createHash('sha256').update(x, 'utf8').digest('hex');

  const request = {
    type: 'autologin',
    username: req.body.userData.uuid,
    projectId: req.body.userData.entity === 'fsa' ? process.env.NP_INT_ID : process.env.NP_EU_ID,
    timeStamp: Math.floor(Date.now() / 1000),
    key: req.body.userData.entity === 'fsa' ? process.env.NP_INT_KEY : process.env.NP_EU_KEY,
  };

  const hash = hashRequest(`request=${request.type}&username=${request.username}&project_id=${request.projectId}&timestamp=${request.timeStamp}&${request.key}`);
  console.log(chalk.cyan(`User: ${req.body.userData.uuid}, entered NP`));

  if (req.body.userData.entity === 'fsa') {
    const generatedUrl = `${process.env.NP_INT_URL}/autologin?username=${request.username}&timestamp=${request.timeStamp}&hash=${hash}`;
    res.status(200).send(generatedUrl);
  } else if (req.body.userData.entity === 'cysec') {
    const generatedUrl = `${process.env.NP_EU_URL}/autologin?username=${request.username}&timestamp=${request.timeStamp}&hash=${hash}`;
    res.status(200).send(generatedUrl);
  } else {
    const generatedUrl = `${process.env.NP_INT_URL}/autologin?username=${request.username}&timestamp=${request.timeStamp}&hash=${hash}`;
    res.status(200).send(generatedUrl);
  }
};

exports.getUserDetails = async (req, res) => {
  const hashRequest = (x) => crypto.createHash('sha256').update(x, 'utf8').digest('hex');
  console.log(req.query);

  const APIUrl = req.query.entity === 'fsa' ? process.env.NP_INT_ADMIN_URL : process.env.NP_EU_ADMIN_URL
  const request = {
    type: 'getaffdetails',
    aff_refid: req.query.externalId,
    projectId: req.query.entity === 'fsa' ? process.env.NP_INT_ID : process.env.NP_EU_ID,
    timeStamp: Math.floor(Date.now() / 1000),
    key: req.query.entity === 'fsa' ? process.env.NP_INT_GEN_KEY : process.env.NP_EU_GEN_KEY,
  };

  const hash = hashRequest(`request=${request.type}&aff_refid=${request.aff_refid}&project_id=${request.projectId}&timestamp=${request.timeStamp}&${request.key}`);
  console.log(chalk.cyan(`User: ${req.query.externalId}, fetched NP data`));

  var requestOptions = {
    method: 'POST',
  };

  console.log(`${APIUrl}/api/${request.type}?request=${request.type}&aff_refid=${request.aff_refid}&project_id=${request.projectId}&timestamp=${request.timeStamp}&hash=${hash}`);

  fetch(`${APIUrl}/api/${request.type}?request=${request.type}&aff_refid=${request.aff_refid}&project_id=${request.projectId}&timestamp=${request.timeStamp}&hash=${hash}`, requestOptions)
  .then(response => { console.log('response', response); return response.json(); })
  .then(result => res.status(200).send(result))
  .catch(error => console.log('error', error));
}
