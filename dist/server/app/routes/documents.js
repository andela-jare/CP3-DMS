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

var document = _express2.default.Router();

document.get('/documents/search', _authenticate2.default.auth, _controllers.documents.search);
document.post('/documents', _authenticate2.default.auth, _controllers.documents.create);
document.get('/documents', _authenticate2.default.auth, _controllers.documents.getDocuments);

document.get('/users/:id/documents', _authenticate2.default.auth, _controllers.documents.usersDocument);
document.get('/documents/:id', _authenticate2.default.auth, _controllers.documents.getDocument);

document.put('/documents/:id', _authenticate2.default.auth, _controllers.documents.update);

document.delete('/documents/:id', _authenticate2.default.auth, _controllers.documents.destroy);

document.get('/documents/search', _controllers.documents.search);

exports.default = document;