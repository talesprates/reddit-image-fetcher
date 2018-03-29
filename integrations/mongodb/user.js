const mongoose = require('mongoose');

module.exports = {
  findUsersByRating,
  findUsersAboveRating,
  createUser,
  updateUserRating,
  addUserSubreddit
};

const userSchema = mongoose.Schema({
  _id: { type: String },
  rating: { type: Number, default: 1 },
  subreddits: { type: [String], default: ['legacy'] }
});

const User = mongoose.model('User', userSchema);

function findUser(userid) {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: userid }, (error, user) => {
      if (error) {
        reject(null);
      } else {
        resolve(user);
      }
    });
  });
}

function updateUserRating(userid, rating) {
  return new Promise((resolve, reject) => {
    User.update({ _id: userid }, { $set: { rating } }, (error) => {
      if (error) {
        reject(error);
      }

      resolve(true);
    });
  });
}

function addUserSubreddit(userid, subreddit) {
  return new Promise((resolve, reject) => {
    User.update({ _id: userid }, { $addToSet: { subreddits: subreddit } }, (error) => {
      if (error) {
        reject(error);
      }

      resolve(true);
    });
  });
}

function createUser(userid, subreddits) {
  return new Promise((resolve, reject) => {
    findUser(userid).then((user) => {
      if (user) {
        resolve(user);
      }

      User.create({ _id: userid, subreddits }, (error, createdUser) => {
        if (error) {
          reject(`user ${userid} already exists`);
        }

        resolve(createdUser);
      });
    });
  });
}

function findUsersByRating(rating) {
  return new Promise((resolve, reject) => {
    User.find({ rating }, (error, users) => {
      if (error) {
        reject(error);
      }
      resolve(users);
    });
  });
}

function findUsersAboveRating(rating) {
  return new Promise((resolve, reject) => {
    User.find({ rating: { $gte: rating } }, (error, users) => {
      if (error) {
        reject(error);
      }
      resolve(users);
    });
  });
}
