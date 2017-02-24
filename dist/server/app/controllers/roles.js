'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _models = require('../../models');

exports.default = {
  /**
   * Get all roles
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {Object} - Returns response object
   */
  index: function index(req, res) {
    return _models.Role.findAll().then(function (roles) {
      return res.send(roles);
    });
  },


  /**
   * Create a role
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {Object} - Returns response object
   */
  create: function create(req, res) {
    return _models.Role.create(req.body).then(function (role) {
      return res.status(201).send(role);
    }).catch(function (error) {
      return res.status(400).send(error);
    });
  },


  /**
  * Get a particular role
  * @param {Object} req request object
  * @param {Object} res response object
  * @returns {Object} - Returns response object
  */
  find: function find(req, res) {
    return _models.Role.findById(req.params.id).then(function (role) {
      if (!role) {
        return res.status(404).send({
          message: 'Role with id: ' + req.params.id + ' not found.'
        });
      }
      res.send(role);
    });
  },


  /**
   * Update a particular role
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {Object} - Returns response object
   */
  update: function update(req, res) {
    return _models.Role.findById(req.params.id).then(function (role) {
      if (!role) {
        return res.status(404).send({
          message: 'Role with id: ' + req.params.id + ' not found.',
          success: false
        });
      }
      role.update(req.body).then(function (updatedRole) {
        return res.send(updatedRole);
      });
    });
  },


  /**
   * Delete a particular role
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {Object} - Returns response object
   */
  destroy: function destroy(req, res) {
    return _models.Role.findById(req.params.id).then(function (role) {
      if (!role) {
        return res.status(404).send({
          message: 'Role with id: ' + req.params.id + ' not found.'
        });
      }
      role.destroy().then(function () {
        return res.send({ message: 'Role deleted successfully.' });
      });
    });
  }
};