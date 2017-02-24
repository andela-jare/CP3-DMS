'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _models = require('../../models');

var _models2 = _interopRequireDefault(_models);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Class to implement authentication middlewares
 */
var Authenticate = function () {
  function Authenticate() {
    _classCallCheck(this, Authenticate);
  }

  _createClass(Authenticate, null, [{
    key: 'auth',

    /**
     * Method to authenticate a user before proceeding
     * to protected routes
     * @param {Object} req - The request Object
     * @param {Object} res - The response Object
     * @param {Function} next - Function call to move to the next middleware
     * or endpoint controller
     * @return {Void} - Returns void
     */
    value: function auth(req, res, next) {
      var token = req.headers['x-access-token'] || req.body.token;
      if (token) {
        _jsonwebtoken2.default.verify(token, process.env.SECRET, function (error, decoded) {
          if (error) return res.status(401).send(error);
          req.decoded = decoded;
          next();
        });
      } else {
        res.status(403).send({
          message: 'Authentication is required. No token provided.'
        });
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

  }, {
    key: 'permitAdmin',
    value: function permitAdmin(req, res, next) {
      _models2.default.Role.findById(req.decoded.roleId).then(function (role) {
        if (role.title === 'admin') {
          next();
        } else {
          return res.status(401).send({ message: 'You are not authorized!' });
        }
      });
    }
  }, {
    key: 'verifyLimitOffset',
    value: function verifyLimitOffset(res, query, min) {
      if (query < min || query > 10) {
        return res.status(400).send({
          message: 'Please enter a valid number within the range 1 - 10.'
        });
      }
    }
  }]);

  return Authenticate;
}();

exports.default = Authenticate;