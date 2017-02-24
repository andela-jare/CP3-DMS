'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.roles = exports.documents = exports.users = undefined;

var _users = require('./users');

var _users2 = _interopRequireDefault(_users);

var _documents = require('./documents');

var _documents2 = _interopRequireDefault(_documents);

var _roles = require('./roles');

var _roles2 = _interopRequireDefault(_roles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.users = _users2.default;
exports.documents = _documents2.default;
exports.roles = _roles2.default;