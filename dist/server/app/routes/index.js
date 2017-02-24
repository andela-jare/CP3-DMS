'use strict';

var _users = require('./users');

var _users2 = _interopRequireDefault(_users);

var _documents = require('./documents');

var _documents2 = _interopRequireDefault(_documents);

var _roles = require('./roles');

var _roles2 = _interopRequireDefault(_roles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  userRoutes: _users2.default, documentRoutes: _documents2.default, roleRoutes: _roles2.default
};