import db from '../../models';
import UserHelper from '../helper/users';

/**
 * class UserAccess as middleware for user's controllers
 */
class UserAccess {
  /**
   * Method to authenticate a user before proceeding
   * to protected user routes
   * @param {Object} req - The request Object
   * @param {Object} res - The response Object
   * @param {Function} next - Function call to move to the next middleware
   * or endpoint controller
   * @return {void} - Returns void
   */
  static userDeleteAccess(req, res, next) {
    db.User.findById(req.params.id)
      .then((user) => {
        if (!user) {
          return res.status(404)
            .send({ message: 'User Not found.' });
        }

        if (UserHelper.userOrAdmin(req)) {
          return res.status(403)
            .send({
              message: 'You are restricted from performing this action.'
            });
        }

        if (UserHelper.isAdmin(user.roleId)) {
          return res.status(403)
            .send({
              message: 'You can not delete an admin!'
            });
        }

        req.user = user;
        next();
      });
  }

  /**
   * Method to authenticate a user before proceeding
   * to protected user routes
   * @param {Object} req - The request Object
   * @param {Object} res - The response Object
   * @param {Function} next - Function call to move to the next middleware
   * or endpoint controller
   * @return {void} - Returns void
   */
  static userUpdateAccess(req, res, next) {
    db.User.findById(req.params.id)
      .then((user) => {
        if (!user) {
          return res.status(404)
            .send({ message: 'User not found.' });
        }

        if (UserHelper.userOrAdmin(req)) {
          return res.status(403)
            .send({
              message: 'You are restricted from performing this action.'
            });
        }

        req.queryBuilder = UserHelper.usersFields(req.body);
        if (UserHelper.isAdmin(req.decoded.roleId)
        && req.decoded.userId !== user.id) {
          if (req.body.roleId) {
            req.queryBuilder = {
              roleId: req.body.roleId
            };
          } else {
            return res.status(400)
              .send({
                message: 'No role id provided.'
              });
          }
        }

        req.user = user;
        next();
      });
  }

  /**
   * Method to authenticate a user before proceeding
   * to protected user routes
   * @param {Object} req - The request Object
   * @param {Object} res - The response Object
   * @param {Function} next - Function call to move to the next middleware
   * or endpoint controller
   * @return {void} - Returns void
   */
  static userCreateAccess(req, res, next) {
    if (req.body.id) {
      return res.status(400)
        .send({
          message: 'Sorry, You can\'t pass an id.'
        });
    }

    if (UserHelper.isAdmin(req.body.roleId)) {
      return res.status(400)
        .send({
          message: 'You can\'t sign up as an admin.'
        });
    }
    next();
  }

  /**
   * Method to authenticate a user before proceeding
   * to protected user routes
   * @param {Object} req - The request Object
   * @param {Object} res - The response Object
   * @param {Function} next - Function call to move to the next middleware
   * or endpoint controller
   * @return {void} - Returns void
   */
  static userLogout(req, res, next) {
    db.User.findById(req.decoded.userId)
    .then((user) => {
      req.user = user;
      next();
    });
  }
}

export default UserAccess;
