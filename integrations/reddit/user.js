const request = require('request-promise');
/* eslint-disable camelcase */
const { user_agent } = require('./credentials');


function getUserPosts(access_token, user) {
  return new Promise((resolve) => {
    const options = {
      uri: `https://oauth.reddit.com/user/${user}/submitted`,
      headers: {
        Authorization: `bearer ${access_token}`,
        'User-Agent': user_agent
      },
      qs: {
        limit: 100,
        sort: 'new'
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
