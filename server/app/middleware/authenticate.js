import jwt from 'jsonwebtoken';

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
}
// export default Authenticate;
module.exports = Authenticate;
