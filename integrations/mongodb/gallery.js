const mongoose = require('mongoose');

module.exports = {
  createGallery,
  findGallery
};

const gallerySchema = mongoose.Schema({
  _id: { type: String },
  user: { type: String, required: true }
});

const Gallery = mongoose.model('Gallery', gallerySchema);

function findGallery(hashCode) {
  return new Promise((resolve, reject) => {
    Gallery.findOne({ _id: hashCode }, (error, gallery) => {
      if (error) {
        reject(null);
      } else {
        resolve(gallery);
      }
    });
  });
}

function createGallery(hashCode, user) {
  return new Promise((resolve, reject) => {
    findGallery(hashCode).then((gallery) => {
      if (gallery) {
        resolve(gallery);
      }

      Gallery.create({ _id: hashCode, user }, (error, createdGallery) => {
        if (error) {
          reject(`gallery ${hashCode} already exists`);
        }

        resolve(createdGallery);
      });
    });
  });
}
