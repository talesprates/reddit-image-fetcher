const request = require('request-promise');
/* eslint-disable camelcase */
const crypto = require('crypto');
const { client_id, redirect_uri, secret, refresh_token, user_agent } = require('./credentials');

function getAuthUrl() {
  return new Promise((resolve) => {
    const date = (new Date()).valueOf().toString();
    const random = Math.random().toString();
    const hash = crypto.createHash('sha1').update(date + random).digest('hex');
    const url = [`https://ssl.reddit.com/api/v1/authorize?client_id=${client_id}`];
    url.push('response_type=code');
    url.push(`state=${hash}`);
    url.push(`redirect_uri=${redirect_uri}`);
    url.push('duration=permanent');
    url.push('scope=identity,read,history');

    resolve(url.join('&'));
  });
}

function authenticate(code) {
  return new Promise((resolve, reject) => {
    const options = {
      uri: 'https://ssl.reddit.com/api/v1/access_token',
      method: 'POST',
      headers: {
        'User-Agent': user_agent
      },
      auth: {
        user: client_id,
        pass: secret
      },
      form: {
        grant_type: 'authorization_code',
        code,
        redirect_uri
      }
    };

    request(options)
      .then(resolve)
      .catch(reject);
  });
}

function refreshToken() {
  return new Promise((resolve, reject) => {
    const options = {
      uri: 'https://ssl.reddit.com/api/v1/access_token',
      method: 'POST',
      headers: {
        'User-Agent': user_agent
      },
      auth: {
        user: client_id,
        pass: secret
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token
      }
    };

    request(options)
      .then(resolve)
      .catch(reject);
  });
}

module.exports = {
  getAuthUrl,
  authenticate,
  refreshToken
};
