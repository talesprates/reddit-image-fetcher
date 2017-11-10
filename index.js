const imgur = require('./integrations/imgur');
const gfycat = require('./integrations/gfycat');
const fs = require('fs');
const request = require('request');

const extractMediaPattern = /^.*\/(.*((.jpg)|(.png)|(.gifv)|(.gif)|(.mp4)|(.jpeg)))(\?[0-9])?$/;
const IMAGE_NAME = 1;
const redditUser = process.argv[2];

if (redditUser == null) {
  console.log('usage: node index.js {{redditUser}}');
  process.exit(1);
}

// let apiCalls = 0;

const rawJson = fs.readFileSync(`./users/${redditUser}/redditUserImagesCollection.json`);
const { directImages, gfycatImages, imgurImages, imgurGalleries } = JSON.parse(rawJson);

// apiCalls = apiCalls + imgurGalleries.length + imgurImages.length;

Promise.all(directImages.map(image => downloadImage(image)))
  .then(() => console.log('direct images downloaded'))
  .catch(error => console.log(`error downloading direct images from ${redditUser} (${error})`));

imgurGalleries.forEach((gallery) => {
  imgur.getAlbum(gallery)
    .then(images => images.forEach(image => downloadImage(image)))
    .catch(console.log);
});

imgurImages.forEach((image) => {
  imgur.getImage(image)
    .then(imageUrl => downloadImage(imageUrl))
    .catch(console.log);
});

gfycat.authenticate().then((accessToken) => {
  Promise.all(gfycatImages.map(gfyId => gfycat.getImage(accessToken, gfyId).then(downloadImage)))
    .then(() => console.log('gfycat images downloaded'))
    .catch(error => console.log(`error downloading gfycat images from ${redditUser} (${error})`));
});

// console.log(apiCalls);

function downloadImage(uri) {
  return new Promise((resolve, reject) => {
    fs.access(`./users/${redditUser}/${uri.match(extractMediaPattern)[IMAGE_NAME]}`, fs.constants.R_OK, (err) => {
      if (!err) {
        return resolve();
      }

      return request({ uri })
        .pipe(fs.createWriteStream(`./users/${redditUser}/${uri.match(extractMediaPattern)[IMAGE_NAME]}`))
        .on('close', resolve)
        .on('error', reject);
    });
  });
}
