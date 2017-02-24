'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _controllers = require('../controllers');

var _authenticate = require('../middleware/authenticate');

var _authenticate2 = _interopRequireDefault(_authenticate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var user = _express2.default.Router();

user.post('/users', _controllers.users.create);
user.post('/login', _controllers.users.login);
user.get('/logout', _authenticate2.default.auth, _controllers.users.logout);

user.get('/users', _authenticate2.default.auth, _controllers.users.allUsers);
user.get('/users/:id', _authenticate2.default.auth, _controllers.users.findUser);

user.put('/users/:id', _authenticate2.default.auth, _controllers.users.update);

user.delete('/users/:id', _authenticate2.default.auth, _controllers.users.destroy);

exports.default = user;