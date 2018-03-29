const { SUBREDDITS } = require('../variables');
const subredditPage = require('../pages/subredditPage');
const mongo = require('../integrations/mongodb');
// const mkdirp = require('mkdirp-promise');
// const fs = require('fs');

let subredditPages;
let subredditUsers;

SUBREDDITS.forEach((SUBREDDIT) => {
  describe('Save to json all users posts images links', () => {
    beforeAll(() => {
      subredditPages = [`https://www.reddit.com/r/${SUBREDDIT}/`];
      subredditUsers = [];
    });

    it('Store two subreddit pages', () => {
      browser.get(`https://www.reddit.com/r/${SUBREDDIT}/`);
      skipWarning();
      waitElementVisible($(subredditPage.postsTable));
      storePageUrl();
    });

    it('Store all users from two latests subreddits pages', () => {
      subredditPages.forEach((page) => {
        browser.get(page);
        $$(subredditPage.subredditUsers).then((users) => {
          users.forEach(user => user.getAttribute('text').then(userId => subredditUsers.push(userId)));
        });
      });
    });

    it('Get all images links from user\'s posts', () => {
      removeDuplicatesUsers(subredditUsers)
        .splice(2)
        .forEach(user => mongo.createUser(user, SUBREDDIT)
        .catch(mongo.addUserSubreddit(user, SUBREDDIT)));
    });
  });
});

function storePageUrl() {
  browser.isElementPresent($(subredditPage.button.next)).then(() => {
    $(subredditPage.button.next).getAttribute('href').then(url => subredditPages.push(url));
  });
}

function skipWarning() {
  browser.isElementPresent($(subredditPage.button.yes)).then((button) => {
    if (button) {
      $(subredditPage.button.yes).click();
    }
  });
}

function removeDuplicatesUsers(posts) {
  return posts.filter((elem, pos, arr) => arr.indexOf(elem) === pos);
}
