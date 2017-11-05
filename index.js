const imgur = require('./integrations/imgur');
const gfycat = require('./integrations/gfycat');
const { REDDIT_USERS } = require('./variables');
const fs = require('fs');
const request = require('request');

const extractMediaPattern = /^.*\/(.*((.jpg)|(.png)|(.gifv)|(.gif)|(.mp4)|(.jpeg)))(\?[0-9])?$/;
const IMAGE_NAME = 1;

let apiCalls = 0;

REDDIT_USERS.forEach((REDDIT_USER) => {
  const rawJson = fs.readFileSync(`./users/${REDDIT_USER}/redditUserImagesCollection.json`);
  const methods = JSON.parse(rawJson);

  apiCalls = apiCalls + methods.imgurGalleries.length + methods.imgurImages.length;

  Promise.all(methods.directImages.map(image => downloadImage(REDDIT_USER, image)))
    .then()
    .catch(`error downloading direct images from ${REDDIT_USER}`);

  methods.imgurGalleries.forEach((gallery) => {
    imgur.getAlbum(gallery)
      .then(images => images.forEach(image => downloadImage(REDDIT_USER, image)))
      .catch(console.log);
  });
  methods.imgurImages.forEach((image) => {
    imgur.getImage(image)
      .then(imageUrl => downloadImage(REDDIT_USER, imageUrl))
      .catch(console.log);
  });

  methods.gfycatImages.forEach(image =>
    gfycat.getImage(image)
      .then(imageUrl => downloadImage(REDDIT_USER, imageUrl, 60000))
      .catch(console.log));
});

console.log(apiCalls);

function downloadImage(REDDIT_USER, uri) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(`./users/${REDDIT_USER}/${uri.match(extractMediaPattern)[IMAGE_NAME]}`)) {
      request({ uri })
        .pipe(fs.createWriteStream(`./users/${REDDIT_USER}/${uri.match(extractMediaPattern)[IMAGE_NAME]}`))
        .on('close', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    }
  });
}
