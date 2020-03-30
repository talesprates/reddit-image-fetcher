const request = require('request-promise');
/* eslint-disable camelcase */
const { user_agent } = require('./credentials');


function getUserPosts(access_token, user, lastUserPost) {
  return new Promise((resolve) => {
    const options = {
      uri: `https://oauth.reddit.com/user/${user}/submitted`,
      headers: {
        Authorization: `bearer ${access_token}`,
        'User-Agent': user_agent
      },
      qs: {
        limit: 100,
        sort: 'new',
        after: lastUserPost
      },
      json: true
    };

    request(options)
      .then(body => {
        if (body.data == null) {
          resolve([])
        }

        const array = body.data.children;
        console.log(body.data.children[0].data.name);

        if (array.length == 100) {
          getUserPosts(access_token, user, body.data.children[99].data.name)
            .then(innerBody => {
              resolve(array.concat(innerBody))
            })
            .catch(() => resolve(array));
        } else {
          resolve(array)
        }
      })
      .catch(() => resolve([]));
  });
}

module.exports = {
  getUserPosts
};
