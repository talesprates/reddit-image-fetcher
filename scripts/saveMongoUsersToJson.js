const mongo = require('../integrations/mongodb');
const fs = require('fs');
const path = require('path');

const HOURS_IN_A_DAY = 24;
const NON_BLOCKED_USERS = 1;

mongo.findUsersAboveRating(NON_BLOCKED_USERS).then((usersDocuments) => {
  const date = new Date();
  const hours = date.getHours();
  const intervalLength = usersDocuments.length / HOURS_IN_A_DAY;
  const usersDocumentsSubArray =
  usersDocuments.slice(intervalLength * hours, intervalLength * (hours + 1));
  /* eslint dot-notation: 0 */
  const users = usersDocumentsSubArray.map(userDocument => userDocument['_id']);
  fs.writeFile(path.join(__dirname, '../users/users.json'), JSON.stringify(users), 'utf8', (error) => {
    if (error) {
      console.log('error writing file');
      return;
    }
    console.log('sucess');
  });
  mongo.closeConnnection();
});
