const request = require('request-promise');

const { client_id, client_secret } = require('./credentials');


module.exports = {
  authenticate,
  getImage
};

// const pattern = /^.*\/(.*((.jpg)|(.png)|(.gifv)|(.gif)|(.mp4)))(\?[0-9])?$/;

// testArray.forEach((element) => {
//   console.log(`https://giant.gfycat.com/${element.match(pattern)[1]}.mp4`);
//   console.log(`./users/${element.match(pattern)[1]}.mp4`);
// });

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
      .catch(() => reject(`${gfyId} not found`));
  });
}
