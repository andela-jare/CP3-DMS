import { Document } from '../../models';
import helper from '../middleware/helper';

export default {

  /**
   * Create a new document
   * @param {Object} req Request object
   * @param {Object} res Response object
   * @returns {Object} - Returns response object
   */
  create(req, res) {
    Document.create({
      title: req.body.title,
      content: req.body.content,
      access: req.body.access,
      ownerId: req.decoded.userId
    })
    .then(document => res.status(200)
      .send({ document }))
    .catch(error => res.status(400)
      .send({
        message: error.errors[0].message
      }));
  },

  /**
   * Gets a document
   * @param {Object} req Request object
   * @param {Object} res Response object
   * @returns {Object} - Returns response object
   */
  getDocument(req, res) {
    Document.findById(req.params.id)
      .then((document) => {
        if (!document) {
          return res.status(404)
            .send({
              message: 'Document not found.',
            });
        }
        if (helper.documentAccess(document, req)) {
          return res.status(200)
            .send({ document });
        }

        res.status(403)
          .send({ message: 'You are unauthorized.' });
      });
  },

  /**
   * Gets all documents depending on who is requesting
   * @param {Object} req Request object
   * @param {Object} res Response object
   * @returns {Object} - Returns response object
   */
  getDocuments(req, res) {
    let query = {
      where: {
        $or: [
          { ownerId: { $eq: req.decoded.userId } },
          { access: { $eq: 'public' } }
        ]
      }
    };
    query = req.decoded.roleId === 1 ? {} : query;
    query.order = '"createdAt" DESC';
    if (helper.limitOffset(query, req, res) === true) {
      Document.findAll(query)
      .then((document) => {
        res.status(200)
          .send({ document });
      });
    }
  },

  /**
   * Edit and update a specific document
   * @param {Object} req Request object
   * @param {Object} res Response object
   * @returns {Object} - Returns response object
   */
  update(req, res) {
    Document.findById(req.params.id)
      .then((document) => {
        if (!document) {
          return res.status(404)
            .send({ message: 'Document Not found.' });
        }
        if (!helper.isOwner(document, req)) {
          return res.status(403)
            .send({
              message: 'You are not allowed to edit this document.'
            });
        }
        document.update(req.body)
        .then(updatedDocument => res.status(200)
          .send(updatedDocument));
      });
  },

  /**
   * Delete a specific document
   * @param {Object} req Request object
   * @param {Object} res Response object
   * @returns {Object} - Returns response object
   */
  destroy(req, res) {
    Document.findById(req.params.id)
      .then((document) => {
        if (!document) {
          return res.status(404).send({ message: 'Document Not found' });
        }
        if (helper.userOrAdmin(document.ownerId, req)) {
          return res.status(403)
            .send({
              message: 'This document does not belong to you.'
            });
        }
        document.destroy()
        .then(() => res.status(200)
          .send({
            message: 'Document successfully deleted!'
          }));
      });
  },

  /**
   * Gets all documents belonging to a specific user
   * @param {Object} req Request object
   * @param {Object} res Response object
   * @returns {Object} - Returns response object
   */
  usersDocument(req, res) {
    const id = Number(req.params.id);
    let query = {
      where: {
        ownerId: id
      }
    };
    if (helper.norUserAdmin(req)) {
      query = {
        where: {
          ownerId: id,
          access: 'public'
        }
      };
    }
    if (helper.limitOffset(query, req, res) === true) {
      Document.findAll(query)
      .then(documents => res.status(200)
        .send({ documents }));
    }
  },
  /**
   * Gets all documents relevant to search term
   * @param {Object} req Request object
   * @param {Object} res Response object
   * @returns {Object} - Returns response object
   */
  search(req, res) {
    const search = req.query.search.trim();
    let query = {
      where: {
        $and: [{
          $or: {
            title: {
              $ilike: `%${search}%`
            },
            content: {
              $ilike: `%${search}%`
            }
          }
        }, {
          $or: {
            ownerId: req.decoded.userId,
            access: 'public'
          }
        }
        ]
      }
    };

    if (helper.isAdmin(req.decoded.roleId)) {
      query = { where: {
        $or: {
          title: {
            $ilike: `%${search}%`
          },
          content: {
            $ilike: `%${search}%`
          }
        }
      } };
    }
    query.order = '"createdAt" DESC';
    if (helper.limitOffset(query, req, res) === true) {
      Document.findAndCountAll(query)
      .then((docs) => {
        if (!docs.count) {
          return res.status(404)
            .send({
              message: `No results found for ${search}.`
            });
        }
        return res.status(200)
          .send(docs);
      })
      .catch(error => res.status(400)
        .send({ error }));
    }
  }
};
