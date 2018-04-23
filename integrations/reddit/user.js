const request = require('request-promise');
/* eslint-disable camelcase */
const { access_token, user_agent } = require('./credentials');


function getUserPosts(user) {
  return new Promise((resolve) => {
    const options = {
      uri: `https://oauth.reddit.com/user/${user}/submitted`,
      headers: {
        Authorization: `bearer ${access_token}`,
        'User-Agent': user_agent
      },
      json: true
    };

    request(options)
      .then(body => resolve(body.data.children))
      .catch(() => resolve([]));
  });
}

module.exports = {
  getUserPosts
};
