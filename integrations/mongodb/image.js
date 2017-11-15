const mongoose = require('mongoose');

module.exports = {
  createImage,
  updateImageDownload,
  isImageDownloaded,
  findImage,
  closeConnnection,
  getUndownloadedImages,
  getUserImages
};

const imageSchema = mongoose.Schema({
  _id: { type: String },
  link: { type: String },
  downloaded: { type: Boolean, default: false },
  user: { type: String, required: true }
});

const Image = mongoose.model('Image', imageSchema);

function isImageDownloaded(hashCode) {
  return new Promise((resolve, reject) => {
    findImage(hashCode).then(image => image.downloaded).catch(reject);
  });
}

function findImage(hashCode) {
  return new Promise((resolve, reject) => {
    Image.findOne({ _id: hashCode }, (error, image) => {
      if (error) {
        reject(null);
      } else {
        resolve(image);
      }
    });
  });
}

function updateImageDownload(link, downloaded) {
  return new Promise((resolve, reject) => {
    Image.update({ link }, { $set: { downloaded } }, (error) => {
      if (error) {
        reject(error);
      }

      resolve(true);
    });
  });
}

function createImage(hashCode, link, downloaded, user) {
  return new Promise((resolve, reject) => {
    findImage(hashCode).then((image) => {
      if (image) {
        resolve(image);
      }

      Image.create({ _id: hashCode, link, downloaded, user }, (error, createdImage) => {
        if (error) {
          reject(`image ${hashCode} already exists`);
        }

        resolve(createdImage);
      });
    });
  });
}

function getUserImages(user) {
  return new Promise((resolve, reject) => {
    Image.find({ user, downloaded: false }, (error, users) => {
      if (error) {
        reject(error);
      }
      resolve(users);
    });
  });
}

function getUndownloadedImages() {
  return new Promise((resolve, reject) => {
    Image.find({ downloaded: false }, (error, images) => {
      if (error) {
        reject(error);
      }
      resolve(images);
    });
  });
}

function closeConnnection() {
  mongoose.connection.close();
}
