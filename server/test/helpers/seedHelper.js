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
      .catch((err) => {
        logger.error(err);
      });
    });
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
