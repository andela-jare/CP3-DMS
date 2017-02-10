import faker from 'faker';
import bcrypt from 'bcrypt';
import logger from 'fm-log';
import db from '../../models';

/**
 * SeedData class to populate database with default data
 */
class SeedHelper {

  /**
   * Perform the sequential population of the db
   * in order of associations
   * @return {Void} - Returns Void
   */
  static init() {
    db.sequelize.sync({ force: true })
    .then(() => {
      SeedHelper.populateRoleTable()
      .then(() => {
        SeedHelper.populateUserTable()
        .catch((err) => {
          logger.error(err);
        });
      })
      .catch((err) => {
        logger.error(err);
      });
    });
  }

  /**
   * Populates db with users
   * @returns {Object} - a Promise object
   */
  static populateUserTable() {
    const users = [
      {
        username: faker.internet.userName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: 'jorg.are@andela.com',
        password: SeedHelper.hashPass('code'),
        roleId: 1
      },
      {
        username: faker.internet.userName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: SeedHelper.hashPass('pass'),
        roleId: 2
      },
      {
        username: faker.internet.userName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: SeedHelper.hashPass('password'),
        roleId: 2
      },
    ];
    return db.User.bulkCreate(users);
  }

  /**
   * Populates db with default roles
   * @returns {object} - A Promise object
   */
  static populateRoleTable() {
    const roles = [
      {
        title: 'admin',
      },
      {
        title: 'regular'
      },
    ];
    return db.Role.bulkCreate(roles);
  }
  static hashPass(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5));
  }
}

export default SeedHelper.init();
