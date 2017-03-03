import db from '../../models';

/**
 * class AuthStatus to autheticate users
*/
class RoleMiddleware {
  /**
   * Method to authenticate a user before proceeding
   * to protected user routes
   * @param {Object} req - The request Object
   * @param {Object} res - The response Object
   * @param {Function} next - Function call to move to the next middleware
   * or endpoint controller
   * @return {void} - Returns void
   */
  static findRole(req, res, next) {
    db.Role.findById(req.params.id)
      .then((role) => {
        if (!role) {
          return res.status(404)
            .send({
              message: `Role with id: ${req.params.id} not found.`
            });
        }

        if (role.title === 'admin' || role.title === 'regular') {
          return res.status(403)
            .send({
              message: 'You cannot perform any action on admin or regular role.'
            });
        }

        req.role = role;
        next();
      });
  }

}

export default RoleMiddleware;
