const got = require('got');
const qs = require('qs');
const fetch = require('node-fetch');

const s3TokenUrl = process.env.SF_TOKEN_URL;
const s3Url = process.env.SF_URL;

exports.getToken = () => {
  const body = qs.stringify({
    grant_type: 'password',
    client_id: process.env.SF_ID,
    client_secret: process.env.SF_SECRET,
    username: process.env.SF_USER,
    password: process.env.SF_PASS,
  });

  return got.post(s3TokenUrl, {
    body,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  })
    .then((response) => JSON.parse(response.body))
    .then((data) => data.access_token)
    .catch((err) => err);
};

exports.register = async (userData) => {
  const token = await this.getToken();

  got.post(`${s3Url}/users/ib`, {
    body: JSON.stringify({
      uuid: userData.uuid,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phoneNum,
      countryCode: userData.countryCode,
      language: userData.language,
      entity: userData.entity,
    }),
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
  })
    .then((response) => (response))
    .catch((err) => (err));
};

exports.uploadDocument = async (documentData) => {
  const token = await this.getToken();
  fetch(`${s3Url}/user/ib/documents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(documentData),
  })
    .then((response) => (response))
    .catch((error) => {
      throw error;
    });
};

exports.verifyEmailCode = async (uuid, email, pinCode) => new Promise(async (resolve) => {
  const token = await this.getToken();

  fetch(`${s3Url}/users/ib/verify-email`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uuid,
      email,
      pinCode,
    }),
  })
    .then((response) => response[Object.getOwnPropertySymbols(response)[1]])
    .then((res) => {
      if (res.status === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
});

exports.verifyEmailPasswordCode = async (uuid, email, pinCode) => new Promise(async (resolve) => {
  const token = await this.getToken();

  fetch(`${s3Url}/users/ib/verify-password`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uuid,
      email,
      pinCode,
    }),
  })
    .then((response) => response[Object.getOwnPropertySymbols(response)[1]])
    .then((res) => {
      if (res.status === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
});

exports.resendCode = async (req, res) => {
  const token = await this.getToken();

  fetch(`${s3Url}/users/ib/registration/resend-code`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: req.body.email,
    }),
  })
    .then((response) => response[Object.getOwnPropertySymbols(response)[1]])
    .then((response) => {
      res.status(response.status).send();
    })
    .catch((error) => {
      throw error;
    });
};

exports.resetPasswordCode = async (uuid) => {
  const token = await this.getToken();

  fetch(`${s3Url}/user/ib/reset-password`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uuid,
    }),
  })
    .catch((error) => {
      throw error;
    });
};

exports.updateSocialData = async (uuid, socialData) => {
  const token = await this.getToken();

  fetch(`${s3Url}/users/ib`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uuid,
      socialData,
    }),
  })
    .catch((error) => {
      throw error;
    });
};

exports.supportMessage = async (supportInfo) => {
  const token = await this.getToken();

  fetch(`${s3Url}/user/ib/requests`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(supportInfo),
  })
    .catch((error) => {
      throw error;
    });
};
