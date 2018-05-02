const request = require('request-promise');
const credentials = require('./credentials');

module.exports = {
  getAlbum,
  getImage,
  getRemainingCredits
};

function getAlbum(albumHash) {
  return new Promise((resolve, reject) => {
    const options = {
      uri: `https://api.imgur.com/3/album/${albumHash}/images`,
      headers: {
        Authorization: `Client-ID ${credentials['Client-ID']}`
      },
      json: true
    };
    request(options)
      .then(checkError)
      .then(imgurResponse => Promise.all(imgurResponse.map(getImageUrl)))
      .then(resolve)
      .catch(error => reject(`album ${albumHash} (${error.error.data.error})`));
  });
}

function getImage(imageHash) {
  return new Promise((resolve, reject) => {
    const options = {
      uri: `https://api.imgur.com/3/image/${imageHash}`,
      headers: {
        Authorization: `Client-ID ${credentials['Client-ID']}`
      },
      json: true
    };
    request(options)
      .then(checkError)
      .then(getImageUrl)
      .then(({ link }) => resolve(link))
      .catch(error => reject(`image ${imageHash} (${error.error.data.error})`));
  });
}

function checkError(imgurResponse) {
  return new Promise((resolve, reject) => {
    if (imgurResponse.status === 200) {
      resolve(imgurResponse.data);
    } else if (imgurResponse.status === 404) {
      reject('not found');
    } else if (imgurResponse.status === 429) {
      reject('too many requests');
    } else {
      reject(imgurResponse.status, 'critical error');
    }
  });
}

function getImageUrl(image) {
  return new Promise((resolve) => {
    resolve({
      id: image.id,
      link: image.mp4 ? image.mp4 : image.link
    });
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
