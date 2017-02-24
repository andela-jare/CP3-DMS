'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _routes = require('./server/app/routes');

var _routes2 = _interopRequireDefault(_routes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-console */
/* eslint import/no-unresolved: 0 */
_dotenv2.default.config();
var app = (0, _express2.default)();

app.use((0, _morgan2.default)('dev'));
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: true }));

var port = process.env.PORT || 3000;
var httpServer = _http2.default.createServer(app);

// Endpoints route
app.use('/', _routes2.default.userRoutes);
app.use('/', _routes2.default.documentRoutes);
app.use('/roles', _routes2.default.roleRoutes);

// Setup a default catch-all route that sends back a welcome message.
app.get('*', function (req, res) {
  return res.status(200).send({
    message: 'Welcome to Document management'
  });
});

if (!module.parent) {
  httpServer.listen(port, function () {
    return console.log('Server started at port ' + port);
  });
}

// export app for testing
exports.default = app;