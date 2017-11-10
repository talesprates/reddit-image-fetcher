const request = require('request-promise');
const credentials = require('./credentials');

module.exports = {
  getAlbum,
  getImage,
  getRemainingCredits
};

function getAlbum(albumHash) {
  return new Promise((resolve, reject) => {
    getRemainingCredits().then(({ UserRemaining }) => {
      if (UserRemaining < 50) {
        reject('api calls limit reached');
      }
      const options = {
        uri: `https://api.imgur.com/3/album/${albumHash}/images`,
        headers: {
          Authorization: `Client-ID ${credentials['Client-ID']}`
        },
        json: true
      };
      request(options)
      .then(imgurResponse => Promise.all(imgurResponse.data.map(getImageUrl)).then(resolve))
      .catch(() => reject(`${albumHash} not found`));
    });
  });
}

function getImage(imageHash) {
  return new Promise((resolve, reject) => {
    getRemainingCredits().then(({ UserRemaining }) => {
      if (UserRemaining < 50) {
        reject('api calls limit reached');
      }
      const options = {
        uri: `https://api.imgur.com/3/image/${imageHash}`,
        headers: {
          Authorization: `Client-ID ${credentials['Client-ID']}`
        },
        json: true
      };
      request(options)
      .then(imgurResponse => getImageUrl(imgurResponse.data).then(resolve))
      .catch(() => reject(`${imageHash} not found`));
    });
  });
}

function getImageUrl(image) {
  return new Promise((resolve) => {
    if (image.mp4) {
      resolve(image.mp4);
    }
    resolve(image.link);
  });
}

function getRemainingCredits() {
  return new Promise((resolve) => {
    const options = {
      uri: 'https://api.imgur.com/3/credits',
      headers: {
        Authorization: `Client-ID ${credentials['Client-ID']}`
      },
      json: true
    };
    request(options).then(imgurResponse => resolve(imgurResponse.data));
  });
}
