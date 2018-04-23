const authentication = require('./authentication');
const user = require('./user');

module.exports = {
  getAuthUrl: authentication.getAuthUrl,
  authenticate: authentication.authenticate,
  refreshToken: authentication.refreshToken,

  getUserPosts: user.getUserPosts
};
