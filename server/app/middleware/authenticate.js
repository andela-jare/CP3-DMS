import jwt from 'jsonwebtoken';
import db from '../../models';

/**
 * Class to implement authentication middlewares
 */
class Authenticate {
  /**
   * Method to authenticate a user before proceeding
   * to protected routes
   * @param {Object} req - The request Object
   * @param {Object} res - The response Object
   * @param {Function} next - Function call to move to the next middleware
   * or endpoint controller
   * @return {Void} - Returns void
   */
  static auth(req, res, next) {
    const token = req.headers['x-access-token'] || req.body.token;
    if (token) {
      jwt.verify(token, 'secret', (error, decoded) => {
        if (error) return res.status(403).send(error);
        req.decoded = decoded;
        next();
      });
    } else {
      res.status(401).send({ message: 'Authentication is required' });
    }
  }

  /**
   * Method to verify that user is an Admin
   * to access Admin endpoints
   * @param{Object} req - Request Object
   * @param{Object} res - Response Object
   * @param{Object} next - Function to pass flow to the next controller
   * @return{Void|Object} - returns Void or response object.
   */
  static permitAdmin(req, res, next) {
    db.Role.findById(req.decoded.roleId)
      .then((role) => {
        if (role.title === 'admin') {
          next();
        } else {
          return res.status(403).send({ message: 'You are not an admin' });
        }
      });
  }
}
export default Authenticate;
