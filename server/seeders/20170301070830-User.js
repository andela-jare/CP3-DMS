const dotenv = require('dotenv');

dotenv.config();
module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('Users', [
      {
        id: 1,
        username: process.env.USER_USERNAME,
        firstName: process.env.USER_FIRSTNAME,
        lastName: process.env.USER_LASTNAME,
        email: process.env.USER_EMAIL,
        password: process.env.USER_PASSWORD,
        token: process.env.USER_TOKEN,
        roleId: process.env.USER_ROLEID,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('Users',
      { username: [process.env.USER_USERNAME] }
    );
  }
};
