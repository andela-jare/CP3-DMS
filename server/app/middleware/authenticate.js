import jwt from 'jsonwebtoken';
import db from '../../models';
import Response from '../helper/response';

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
   * @return {void} - Returns void
   */
  static auth(req, res, next) {
    const token = req.headers['x-access-token'];
    if (token) {
      jwt.verify(token, process.env.SECRET, (error, decoded) => {
        if (error) {
          return Response
            .authenticate(res, 'Invalid token. Login or register to continue');
        }
        db.User.findById(decoded.userId)
        .then((user) => {
          if (user.token !== 'registered' && user.token !== token) {
            return Response
              .authenticate(res, 'Please sign in or register to continue.');
          }
          req.decoded = decoded;
          req.decoded.roleId = user.roleId;
          next();
        });
      });
    } else {
      Response
        .authenticate(res, 'Authentication is required. No token provided.');
    }
  }

  /**
   * Method to verify that user is an Admin
   * to access Admin endpoints
   * @param{Object} req - Request Object
   * @param{Object} res - Response Object
   * @param{Object} next - Function to pass flow to the next controller
   * @return{void|Object} - returns void or response object.
   */
  static permitAdmin(req, res, next) {
    db.Role.findById(req.decoded.roleId)
      .then((role) => {
        if (role.title === 'admin') {
          next();
        } else {
          return Response.restricted(res, 'You are not authorized!');
        }
      });
  }

   /**
   * Method to genrate token
   * @param {Object} user - User's object
   * @return {String} - Returns jwt token for further authentication
   */
  static generateToken(user) {
    const token = jwt.sign({
      userId: user.id
    }, process.env.SECRET, { expiresIn: '24h' });
    return token;
  }
}
export default Authenticate;
