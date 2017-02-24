'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _models = require('../../models');

var _authenticate = require('../middleware/authenticate');

var _authenticate2 = _interopRequireDefault(_authenticate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

  /**
   * Create a new document
   * @param {Object} req Request object
   * @param {Object} res Response object
   * @returns {Object} - Returns response object
   */
  create: function create(req, res) {
    _models.Document.create({
      title: req.body.title,
      content: req.body.content,
      access: req.body.access,
      ownerId: req.decoded.userId
    }).then(function (document) {
      return res.status(200).send({ document: document });
    }).catch(function (error) {
      return res.status(400).send({ error: error });
    });
  },


  /**
   * Gets a document
   * @param {Object} req Request object
   * @param {Object} res Response object
   * @returns {Object} - Returns response object
   */
  getDocument: function getDocument(req, res) {
    _models.Document.findById(req.params.id).then(function (document) {
      if (!document) {
        return res.status(404).send({
          message: 'Document Not found.',
          status: false
        });
      }
      if (document.access === 'public' || document.ownerId === req.decoded.userId || req.decoded.roleId === 1) {
        return res.status(200).send({ document: document });
      }

      res.status(401).send({ message: 'You are unauthorized.' });
    });
  },


  /**
   * Gets all documents depending on who is requesting
   * @param {Object} req Request object
   * @param {Object} res Response object
   * @returns {Object} - Returns response object
   */
  getDocuments: function getDocuments(req, res) {
    var query = {
      where: {
        $or: [{ ownerId: { $eq: req.decoded.userId } }, { access: { $eq: 'public' } }]
      }
    };
    query = req.decoded.roleId === 1 ? {} : query;
    query.order = '"createdAt" DESC';
    _authenticate2.default.verifyLimitOffset(res, req.query.limit, 1);
    _authenticate2.default.verifyLimitOffset(res, req.query.offset, 0);
    query.limit = req.query.limit ? req.query.limit : 10;
    query.offset = req.query.offset ? req.query.offset : 0;
    _models.Document.findAll(query).then(function (document) {
      res.status(200).send({ document: document });
    });
  },


  /**
   * Edit and update a specific document
   * @param {Object} req Request object
   * @param {Object} res Response object
   * @returns {Object} - Returns response object
   */
  update: function update(req, res) {
    _models.Document.findById(req.params.id).then(function (document) {
      if (!document) {
        return res.status(404).send({ message: 'Document Not found.' });
      }
      if (document.ownerId !== req.decoded.userId) {
        return res.status(401).send({
          message: 'You are not allowed to edit this document.'
        });
      }
      document.update(req.body).then(function (updatedDocument) {
        return res.status(200).send(updatedDocument);
      });
    });
  },


  /**
   * Delete a specific document
   * @param {Object} req Request object
   * @param {Object} res Response object
   * @returns {Object} - Returns response object
   */
  destroy: function destroy(req, res) {
    _models.Document.findById(req.params.id).then(function (document) {
      if (!document) {
        return res.status(404).send({ message: 'Document Not found' });
      }
      if (document.ownerId !== req.decoded.userId && req.decoded.roleId !== 1) {
        return res.status(401).send({
          message: 'This document does not belong to you.'
        });
      }
      document.destroy().then(function () {
        return res.status(200).send({
          message: 'Document successfully deleted!'
        });
      });
    });
  },


  /**
   * Gets all documents belonging to a specific user
   * @param {Object} req Request object
   * @param {Object} res Response object
   * @returns {Object} - Returns response object
   */
  usersDocument: function usersDocument(req, res) {
    var id = Number(req.params.id);
    _models.Document.findAll({
      where: {
        ownerId: id
      }
    }).then(function (documents) {
      if (req.decoded.userId === id || req.decoded.roleId === 1) {
        return res.status(200).send({ documents: documents });
      }
      res.status(401).send({ message: 'Access denied!' });
    });
  },

  /**
   * Gets all documents relevant to search term
   * @param {Object} req Request object
   * @param {Object} res Response object
   * @returns {Object} - Returns response object
   */
  search: function search(req, res) {
    var search = req.query.search.trim();
    var query = {
      where: {
        $and: [{
          $or: {
            title: {
              $ilike: '%' + search + '%'
            },
            content: {
              $ilike: '%' + search + '%'
            }
          }
        }, {
          $or: {
            ownerId: req.decoded.userId,
            access: 'public'
          }
        }]
      }
    };

    if (req.decoded.roleId === 1) {
      query = { where: {
          $or: {
            title: {
              $ilike: '%' + search + '%'
            },
            content: {
              $ilike: '%' + search + '%'
            }
          }
        } };
    }
    query.order = '"createdAt" DESC';
    _authenticate2.default.verifyLimitOffset(res, req.query.limit, 1);
    _authenticate2.default.verifyLimitOffset(res, req.query.offset, 0);
    query.limit = req.query.limit ? +req.query.limit : 10;
    query.offset = req.query.offset ? +req.query.offset : 0;
    _models.Document.findAll(query).then(function (docs) {
      return res.status(200).send(docs);
    }).catch(function (error) {
      return res.status(400).send({ error: error });
    });
  }
};