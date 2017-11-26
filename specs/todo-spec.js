const { REDDIT_USERS } = require('../variables');
const userPostsPage = require('../pages/userPostsPage');
const mkdirp = require('mkdirp-promise');
const fs = require('fs');

const IMAGE_NAME = 1;
const directImagePattern = /^(.*(\.jpe?g|\.png|\.mp4))(\?[0-9])?$/;
const imgurGalleryPattern = /^.*\/(?:a|gallery)\/(.*)(#.*)?$/;
const imgurImagePattern = /^.*\/([^.]*)(\..*)?$/;
const gfycatImagePattern = /^.*\/([^.]*)(\..*)?$/;
let redditUserImagesCollection;
let userPostPages;
let userPosts;

REDDIT_USERS.forEach((REDDIT_USER) => {
  describe('Save to json all users posts images links', () => {
    beforeAll(() => {
      mkdirp(`./users/${REDDIT_USER}/`)
        .then(() => console.log(`directory ./users/${REDDIT_USER}/ created.`))
        .catch(console.log);
      userPostPages = [`https://www.reddit.com/user/${REDDIT_USER}/submitted/`];
      userPosts = [];
      redditUserImagesCollection = {
        directImages: [],
        imgurGalleries: [],
        imgurImages: [],
        gfycatImages: [],
        rejectedImages: []
      };
    });

    it('Store all user posts pages', () => {
      browser.get(`https://www.reddit.com/user/${REDDIT_USER}/submitted/`);
      skipWarning();
      waitElementVisible($(userPostsPage.postsTable));
      storePageUrl();
    });

    it('Store all user posts urls', () => {
      userPostPages.forEach((page) => {
        browser.get(page);
        $$(userPostsPage.postsTitle).then((posts) => {
          posts.forEach(post => post.getAttribute('href').then(postUrl => userPosts.push(postUrl)));
        });
      });
    });

    it('Get all images links from user\'s posts', () => {
      removeDuplicatePosts(userPosts).forEach(getImageFromPost);
    });

    it('Write user\'s images links into a json', () => {
      fs.writeFile(`./users/${REDDIT_USER}/redditUserImagesCollection.json`, JSON.stringify(redditUserImagesCollection), 'utf8', (error) => {
        if (error) {
          console.log('error writing file');
        }
        console.log('sucess');
      });
    });
  });
});

function getImageFromPost(postUrl) {
  if (postUrl.includes('reddit')) {
    browser.get(postUrl);
    skipWarning();
    $$(userPostsPage.reddit).each((image) => {
      image.getAttribute('href').then((imageUrl) => {
        if (imageUrl.match(directImagePattern)) {
          redditUserImagesCollection.directImages.push(imageUrl);
        } else {
          redditUserImagesCollection.rejectedImages.push(postUrl);
        }
      });
    });
  } else if (postUrl.includes('imgur')) {
    if (postUrl.match(directImagePattern)) {
      redditUserImagesCollection.directImages.push(postUrl);
    } else if (postUrl.match(imgurGalleryPattern)) {
      redditUserImagesCollection
        .imgurGalleries.push(postUrl.match(imgurGalleryPattern)[IMAGE_NAME]);
    } else if (postUrl.match(imgurImagePattern)) {
      redditUserImagesCollection.imgurImages.push(postUrl.match(imgurImagePattern)[IMAGE_NAME]);
    } else {
      redditUserImagesCollection.rejectedImages.push(postUrl);
    }
  } else if (postUrl.includes('gfycat')) {
    if (postUrl.match(gfycatImagePattern)) {
      redditUserImagesCollection.gfycatImages.push(postUrl.match(gfycatImagePattern)[IMAGE_NAME].replace('-size_restricted.gif', ''));
    } else {
      redditUserImagesCollection.rejectedImages.push(postUrl);
    }
  } else {
    redditUserImagesCollection.rejectedImages.push(postUrl);
  }
}

function storePageUrl() {
  browser.isElementPresent($(userPostsPage.button.next)).then((nextButton) => {
    if (nextButton) {
      $(userPostsPage.button.next).getAttribute('href').then(url => userPostPages.push(url));
      $(userPostsPage.button.next).click();
      storePageUrl();
    }
  });
}

function skipWarning() {
  browser.isElementPresent($(userPostsPage.button.yes)).then((button) => {
    if (button) {
      $(userPostsPage.button.yes).click();
    }
  });
}

function removeDuplicatePosts(posts) {
  return posts.filter((elem, pos, arr) => arr.indexOf(elem) === pos);
}
