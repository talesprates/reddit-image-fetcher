const mongoose = require('mongoose');
const image = require('./image');
const gallery = require('./gallery');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/reddit-images-db');

module.exports = {
  createImage: image.createImage,
  updateImageDownload: image.updateImageDownload,
  isImageDownloaded: image.isImageDownloaded,
  findImage: image.findImage,
  closeConnnection: image.closeConnnection,
  getUndownloadedImages: image.getUndownloadedImages,
  getUserImages: image.getUserImages,

  createGallery: gallery.createGallery,
  findGallery: gallery.findGallery
};
