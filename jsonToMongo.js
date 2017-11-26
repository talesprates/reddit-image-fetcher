const fs = require('fs');
const mongo = require('./integrations/mongodb/');
const { REDDIT_USERS } = require('./variables');
const imgur = require('./integrations/imgur');
const gfycat = require('./integrations/gfycat');

const extractMediaPattern = /^.*\/(.*)(\.jpe?g|\.png|\.mp4)(\?[0-9])?$/;
const ID = 1;
const EXTENSION = 2;

Promise.all(REDDIT_USERS.map((redditUser) => {
  const rawJson = fs.readFileSync(`./users/${redditUser}/redditUserImagesCollection.json`);
  const { imgurImages, imgurGalleries, directImages, gfycatImages } = JSON.parse(rawJson);

  const p1 = Promise.all(imgurImages.map(hashCode =>
    findOrCreateImage(redditUser, hashCode).catch(console.log)));
  const p2 = Promise.all(imgurGalleries.map(hashCode =>
    findOrCreateGallery(redditUser, hashCode).catch(console.log)));
  const p3 = Promise.all(directImages.map(link =>
    findOrCreateImage(redditUser, link.match(extractMediaPattern)[ID], link).catch(console.log)));
  const p4 = gfycat.authenticate().then(accessToken => Promise.all(gfycatImages.map(gfyId =>
    findOrCreateGfycat(accessToken, redditUser, gfyId).catch(console.log))));

  return Promise.all([p1, p2, p3, p4]);
})).then(() => mongo.closeConnnection());

function findOrCreateImage(redditUser, hashCode, url) {
  return new Promise((resolve, reject) => {
    mongo.findImage(hashCode).then((image) => {
      if (image) {
        return resolve(image);
      }

      if (url) {
        return fileExists(redditUser, url)
          .then(downloaded => mongo.createImage(hashCode, url, downloaded, redditUser))
          .then(resolve)
          .catch(error => resolve(`${error} from user ${redditUser}`));
      }
      return imgur.getImage(hashCode)
        .then(link => fileExists(redditUser, link)
        .then(downloaded => mongo.createImage(hashCode, link, downloaded, redditUser)))
        .then(resolve)
        .catch(error => reject(`${error} from user ${redditUser}`));
    });
  });
}

function findOrCreateGallery(redditUser, hashCode) {
  return new Promise((resolve, reject) => {
    mongo.findGallery(hashCode).then((gallery) => {
      if (gallery) {
        return resolve(gallery);
      }

      return imgur.getAlbum(hashCode)
        .then(images =>
          Promise.all(images.map(image => findOrCreateImage(redditUser, image.id, image.link))))
        .then(() => mongo.createGallery(hashCode, redditUser))
        .then(resolve)
        .catch(error => reject(`${error} from user ${redditUser}`));
    });
  });
}

function findOrCreateGfycat(accessToken, redditUser, gfyId) {
  return new Promise((resolve) => {
    mongo.findImage(gfyId).then((image) => {
      if (image) {
        return resolve(image);
      }

      return gfycat.getImage(accessToken, gfyId)
        .then(link => findOrCreateImage(redditUser, gfyId, link))
        .then(resolve)
        .catch(error => resolve(`${error} from user ${redditUser}`));
    });
  });
}

function fileExists(redditUser, file) {
  return new Promise((resolve) => {
    const fileName = file.match(extractMediaPattern)[ID];
    const fileExtension = file.match(extractMediaPattern)[EXTENSION];
    fs.access(`./users/${redditUser}/${fileName}${fileExtension}`, fs.constants.R_OK, (err) => {
      if (err) {
        resolve(false);
      }

      resolve(true);
    });
  });
}
