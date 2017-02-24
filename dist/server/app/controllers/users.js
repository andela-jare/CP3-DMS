'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _models = require('../../models');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  /**
   * Create a new user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} - Returns response object
   */
  create: function create(req, res) {
    _models.User.create(req.body).then(function (user) {
      var token = _jsonwebtoken2.default.sign({
        message: 'signedUp',
        userId: user.id,
        roleId: user.roleId
      }, process.env.SECRET, { expiresIn: '24h' });
      res.status(201).json({
        success: true,
        message: 'You have successfully signed up!',
        token: token,
        userId: user.id,
        userEmail: user.email
      });
    }).catch(function (error) {
      return res.status(400).send({ error: error });
    });
  },


  /**
   * Login a user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} - Returns response object
   */
  login: function login(req, res) {
    _models.User.findOne({
      where: {
        username: req.body.username
      }
    }).then(function (user) {
      var correct = _bcrypt2.default.compareSync(req.body.password, user.password);
      if (correct) {
        var token = _jsonwebtoken2.default.sign({
          message: 'loggedIn',
          userId: user.id,
          roleId: user.roleId
        }, process.env.SECRET, { expiresIn: '24h' });
        return res.status(200).json({
          success: true,
          message: 'You have successfully signed in!',
          token: token,
          userId: user.id,
          userEmail: user.email
        });
      }
      return res.status(400).send({
        message: 'Incorrect username and password combination!'
      });
    }).catch(function (error) {
      return res.status(400).send({ error: error });
    });
  },


  /**
  * logout - Logout a user
  *
  * @param  {Objec} req - Request Object
  * @param  {Object} res - Response Object
  * @returns {Object} - Returns response object
  */
  logout: function logout(req, res) {
    return res.status(200).send({
      message: 'You have successfully logged out'
    });
  },


  /**
   * Get all users with their fields
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  allUsers: function allUsers(req, res) {
    _models.User.findAll({
      attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'roleId', 'createdAt', 'updatedAt']
    }).then(function (users) {
      res.status(200).send(users);
    }).catch(function (error) {
      return res.status(400).send({ error: error });
    });
  },


  /**
  * Get a specific user
  * @param {Object} req - Request object
  * @param {Object} res - Response object
  * @returns {Object} - Returns response object
  */
  findUser: function findUser(req, res) {
    _models.User.findById(req.params.id, {
      attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'roleId', 'createdAt', 'updatedAt']
    }).then(function (user) {
      if (!user) return res.status(404).send({ message: 'User not found.' });
      res.status(200).send(user);
    }).catch(function (error) {
      return res.status(400).send({ error: error });
    });
  },


  /**
   * Edit and update a specific user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} - Returns response object
   */
  update: function update(req, res) {
    var userUpdateFields = ['username', 'firstName', 'lastName', 'email', 'password'];
    var query = {};
    Object.keys(req.body).forEach(function (prop) {
      if (userUpdateFields.includes(prop)) {
        query[prop] = req.body[prop];
      }
    });
    _models.User.findById(req.params.id).then(function (user) {
      if (!user) {
        return res.status(404).send({ message: 'User not found.' });
      } else if (Number(req.params.id) !== req.decoded.userId && req.decoded.roleId !== 1) {
        return res.status(401).send({ message: 'You are not authorized.' });
      }
      if (req.decoded.roleId === 1) {
        query = {
          roleId: req.body.roleId
        };
      }
      user.update(query, {
        where: {
          id: req.params.id
        }
      }).then(function (found) {
        res.status(200).send({ found: found });
      }).catch(function (error) {
        return res.status(400).send({ error: error });
      });
    }).catch(function (error) {
      return res.status(400).send({ error: error });
    });
  },


  /**
   * Delete a specific user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} - Returns response object
   */
  destroy: function destroy(req, res) {
    _models.User.findById(req.params.id).then(function (user) {
      if (!user) {
        return res.status(404).send({ error: 'User does not exist' });
      }
      if (req.decoded.roleId !== 1 && req.decoded.userId !== user.id) {
        return res.status(401).send({ error: 'You are not authorized!' });
      }
      user.destroy().then(function () {
        return res.status(200).send({
          message: 'User deleted successfully.'
        });
      });
    });
  }
};