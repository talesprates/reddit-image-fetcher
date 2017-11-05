const Gfycat = require('gfycat-sdk');
const credentials = require('./credentials');

const gfycat = new Gfycat(credentials);

module.exports = {
  isAuthenticated,
  getImage
};

// const pattern = /^.*\/(.*((.jpg)|(.png)|(.gifv)|(.gif)|(.mp4)))(\?[0-9])?$/;

// testArray.forEach((element) => {
//   console.log(`https://giant.gfycat.com/${element.match(pattern)[1]}.mp4`);
//   console.log(`./users/${element.match(pattern)[1]}.mp4`);
// });

function isAuthenticated() {
  return new Promise((resolve, reject) => {
    gfycat.authenticate().then((res) => {
      if (res.access_token !== gfycat.token) {
        reject(false);
      }
      resolve(true);
    });
  });
}

function getImage(gfyId) {
  return new Promise((resolve, reject) => {
    gfycat.getGifDetails({ gfyId })
      .then(data => resolve(data.gfyItem.mp4Url))
      .catch(() => reject(`${gfyId} not found`));
  });
}
