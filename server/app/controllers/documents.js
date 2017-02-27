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
    .then(document => res.status(200).send({ document }))
    .catch(error => res.status(400).send({
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
          return res.status(404).send({
            message: 'Document not found.',
            status: false
          });
        }
        if (document.access === 'public' ||
        document.ownerId === req.decoded.userId
        || req.decoded.roleId === 1) {
          return res.status(200).send({ document });
        }

        res.status(403).send({ message: 'You are unauthorized.' });
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
    const limitSuccess = helper.limitOffsetHelper(req.query.limit, 1);
    const offsetSuccess = helper.limitOffsetHelper(req.query.offset, 0);
    if (!limitSuccess) {
      return res.status(400).send({
        message: 'Enter a valid number for limit within the range 1 - 10.'
      });
    }
    if (!offsetSuccess) {
      return res.status(400).send({
        message: 'Enter a valid number for offset within the range 1 - 10.'
      });
    }
    query.limit = req.query.limit ? req.query.limit : 10;
    query.offset = req.query.offset ? req.query.offset : 0;
    Document.findAll(query)
    .then((document) => {
      res.status(200).send({ document });
    });
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
          return res.status(404).send({ message: 'Document Not found.' });
        }
        if (document.ownerId !== req.decoded.userId) {
          return res.status(403).send({
            message: 'You are not allowed to edit this document.'
          });
        }
        document.update(req.body)
        .then(updatedDocument => res.status(200).send(updatedDocument));
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
        if (document.ownerId !== req.decoded.userId &&
        req.decoded.roleId !== 1
        ) {
          return res.status(403).send({
            message: 'This document does not belong to you.'
          });
        }
        document.destroy()
        .then(() => res.status(200).send({
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
    if (req.decoded.userId !== id || req.decoded.roleId === 1) {
      query = {
        where: {
          ownerId: id,
          access: 'public'
        }
      };
    }
    Document.findAll(query)
    .then(documents => res.status(200).send({ documents }));
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

    if (req.decoded.roleId === 1) {
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
    const limitSuccess = helper.limitOffsetHelper(req.query.limit, 1);
    const offsetSuccess = helper.limitOffsetHelper(req.query.offset, 0);
    if (!limitSuccess) {
      return res.status(400).send({
        message: 'Please enter a valid number within the range 1 - 10.'
      });
    }
    if (!offsetSuccess) {
      return res.status(400).send({
        message: 'Please enter a valid number within the range 1 - 10.'
      });
    }
    query.limit = req.query.limit ? +req.query.limit : 10;
    query.offset = req.query.offset ? +req.query.offset : 0;
    Document.findAll(query)
    .then(docs => res.status(200).send(docs))
    .catch(error => res.status(400).send({ error }));
  }
};
