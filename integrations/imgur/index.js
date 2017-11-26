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
      .catch(error => reject(`album ${albumHash} ${error}`));
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
      .catch(error => reject(`image ${imageHash} ${error}`));
  });
}

function checkError(imgurResponse) {
  return new Promise((resolve, reject) => {
    if (imgurResponse.code === 200) {
      resolve(imgurResponse.data);
    } else if (imgurResponse.code === 404) {
      reject('not found');
    } else if (imgurResponse.code === 429) {
      reject('too many requests');
    } else {
      reject('critical error');
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
