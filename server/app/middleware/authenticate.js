import jwt from 'jsonwebtoken';
import db from '../../models';

class Authenticate {
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
