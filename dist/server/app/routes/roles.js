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

var role = _express2.default.Router();

role.post('/', _authenticate2.default.auth, _authenticate2.default.permitAdmin, _controllers.roles.create);
role.get('/', _authenticate2.default.auth, _authenticate2.default.permitAdmin, _controllers.roles.index);

role.put('/:id', _authenticate2.default.auth, _authenticate2.default.permitAdmin, _controllers.roles.update);
role.get('/:id', _authenticate2.default.auth, _authenticate2.default.permitAdmin, _controllers.roles.find);
role.delete('/:id', _authenticate2.default.auth, _authenticate2.default.permitAdmin, _controllers.roles.destroy);

exports.default = role;