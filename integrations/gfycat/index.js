const request = require('request-promise');

const { client_id, client_secret } = require('./credentials');


module.exports = {
  authenticate,
  getImage
};

function authenticate() {
  const options = {
    method: 'POST',
    uri: 'https://api.gfycat.com/v1/oauth/token',
    body: {
      grant_type: 'client_credentials',
      client_id,
      client_secret
    },
    json: true
  };

  return new Promise((resolve, reject) => {
    request(options)
      .then(data => resolve(data.access_token))
      .catch(reject);
  });
}

function getImage(accessToken, gfyId) {
  return new Promise((resolve, reject) => {
    const options = {
      uri: `https://api.gfycat.com/v1/gfycats/${gfyId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      json: true
    };
    request(options)
      .then(data => resolve(data.gfyItem.mp4Url))
      .catch(() => reject(`gfycat ${gfyId} not found`));
  });
}
