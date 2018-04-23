/* eslint-disable dot-notation */
/* eslint-disable max-len */
const fs = require('fs');
const reddit = require('./integrations/reddit');
const gfycat = require('./integrations/gfycat');
const imgur = require('./integrations/imgur');
const mongo = require('./integrations/mongodb');

const directImagePattern = /^(.*(?:\.jpe?g|\.png|\.mp4))(\?[0-9])?$/;
const imgurGalleryPattern = /^.*\/(?:a|gallery)\/(.*)/;
const imgurImagePattern = /^.*\/([^.]*)(\..*)?$/;
const gfycatImagePattern = /^.*\/([^.]*)(\..*)?$/;
const redditImagePattern = /^.*\?s=(.*)$/;
const extractMediaPattern = /^.*\/(.*)(\.jpe?g|\.png|\.mp4)(\?[0-9])?/;
const FIRST_IMAGE = 0;
const NOT_BLOCKED_USERS = 1;
const IMAGE_NAME = 1;
const ID = 1;
const EXTENSION = 2;


mongo.findUsersAboveRating(NOT_BLOCKED_USERS)
  .then(users => Promise.all(users.map(user => reddit.getUserPosts(user['_id']))))
  .then(usersPosts => Promise.all(usersPosts.map(getPostImage)))
  .then(usersPostsImages => Promise.all(usersPostsImages.filter(post => post.author !== '').map(savePostImagesToMongo)))
  .then(() => mongo.closeConnnection());

function getPostImage(userPosts) {
  return new Promise((resolve) => {
    const mappedPosts = userPosts.reduce((posts, post) => {
      if (post.data.is_reddit_media_domain && post.data.preview && post.data.preview.images[FIRST_IMAGE].source.url.match(redditImagePattern)) {
        posts.redditImages.push(post.data.preview.images[FIRST_IMAGE].source.url);
      } else if (post.data.url.match(directImagePattern)) {
        posts.directImages.push(post.data.url.match(directImagePattern)[IMAGE_NAME]);
      } else if (post.data.url.match(imgurGalleryPattern) && (post.data.domain === 'imgur.com' || post.data.domain === 'i.imgur.com')) {
        posts.imgurGalleries.push(post.data.url.match(imgurGalleryPattern)[IMAGE_NAME]);
      } else if (post.data.url.match(imgurImagePattern) && (post.data.domain === 'imgur.com' || post.data.domain === 'i.imgur.com')) {
        posts.imgurImages.push(post.data.url.match(imgurImagePattern)[IMAGE_NAME]);
      } else if (post.data.url.match(gfycatImagePattern) && post.data.domain === 'gfycat.com') {
        posts.gfycatImages.push(post.data.url.match(gfycatImagePattern)[IMAGE_NAME]);
      } else {
        posts.rejected.push(post.data.url);
      }
      posts.author = post.data.author;

      return posts;
    }, { author: '', directImages: [], redditImages: [], imgurImages: [], imgurGalleries: [], gfycatImages: [], rejected: [] });
    mappedPosts.directImages = removeDuplicatePosts(mappedPosts.directImages);
    mappedPosts.redditImages = removeDuplicatePosts(mappedPosts.redditImages);
    mappedPosts.imgurImages = removeDuplicatePosts(mappedPosts.imgurImages);
    mappedPosts.imgurGalleries = removeDuplicatePosts(mappedPosts.imgurGalleries);
    mappedPosts.gfycatImages = removeDuplicatePosts(mappedPosts.gfycatImages);
    resolve(mappedPosts);
  });
}

function removeDuplicatePosts(posts) {
  return posts.filter((elem, pos, arr) => arr.indexOf(elem) === pos);
}

function savePostImagesToMongo(postImages) {
  return new Promise((resolve) => {
    const { author, directImages, redditImages, imgurImages, imgurGalleries, gfycatImages } = postImages;
    const p1 = Promise.all(imgurImages.map(hashCode =>
      findOrCreateImage(author, hashCode).catch(console.log)));
    const p2 = Promise.all(imgurGalleries.map(hashCode =>
      findOrCreateGallery(author, hashCode).catch(console.log)));
    const p3 = Promise.all(directImages.map(link =>
      findOrCreateImage(author, link.match(extractMediaPattern)[ID], link).catch(console.log)));
    const p4 = gfycat.authenticate().then(accessToken => Promise.all(gfycatImages.map(gfyId =>
      findOrCreateGfycat(accessToken, author, gfyId).catch(console.log))));
    const p5 = Promise.all(redditImages.map(link =>
      findOrCreateImage(author, link.match(redditImagePattern)[ID], link).catch(console.log)));

    Promise.all([p1, p2, p3, p4, p5])
      .then(resolve);
  });
}

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
    fs.access(`../users/${redditUser}/${fileName}${fileExtension}`, fs.constants.R_OK, (err) => {
      if (err) {
        resolve(false);
      }

      resolve(true);
    });
  });
}
