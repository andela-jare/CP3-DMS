import { Document } from '../../models';
import helper from '../middleware/helper';
import ErrorStatus from '../helper/ErrorStatus';
import Paginate from '../helper/paginate';

const Documents = {

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
    .catch(error => ErrorStatus.queryFail(res, 400, error));
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

    if (helper.limitOffset(req, res) === true) {
      Document.findAndCountAll(query)
      .then((documents) => {
        const paginate = Paginate.paginator(req, documents);

        res.status(200)
          .send({
            documents,
            metaData: {
              totalPages: paginate.totalPages,
              currentPage: paginate.currentPage
            }
          });
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
    req.document.update(req.body, { plain: true })
      .then(updatedDocument => res.status(200)
        .send(updatedDocument));
  },

  /**
   * Delete a specific document
   * @param {Object} req Request object
   * @param {Object} res Response object
   * @returns {Object} - Returns response object
   */
  destroy(req, res) {
    const query = {
      where: {
        id: req.params.id
      }
    };
    Document.destroy(query)
      .then(() => res.status(200)
        .send({
          message: 'Document successfully deleted!'
        }));
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
    if (helper.limitOffset(req, res) === true) {
      query.limit = req.query.limit;
      query.offset = req.query.offset;

      Document.findAndCountAll(query)
      .then((documents) => {
        const paginate = Paginate.paginator(req, documents);

        res.status(200)
          .send({
            documents,
            metaData: {
              totalPages: paginate.totalPages,
              currentPage: paginate.currentPage
            }
          });
      });
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
    if (helper.limitOffset(req, res) === true) {
      Document.findAndCountAll(req.queryBuilder)
      .then((documents) => {
        if (!documents.count) {
          return res.status(404)
            .send({
              message: `No results found for ${search}.`
            });
        }

        const paginate = Paginate.paginator(req, documents);

        return res.status(200)
          .send({
            documents,
            metaData: {
              totalPages: paginate.totalPages,
              currentPage: paginate.currentPage
            }
          });
      })
      .catch(error => res.status(400)
        .send({ error }));
    }
  }
};

export default Documents;
