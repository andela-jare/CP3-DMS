import { Role } from '../../models';
import Paginate from '../helper/paginate';
import utility from '../helper/utility';
import Response from '../helper/response';

const Roles = {
  /**
   * Get all roles
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {Object} - Returns response object
   */
  index(req, res) {
    const query = {
      limit: req.query.limit,
      offset: req.query.offset
    };

    if (utility.limitOffset(req, res) === true) {
      Role.findAndCountAll(query)
      .then((roles) => {
        const paginate = Paginate.paginator(req, roles);

        res.status(200)
          .send({
            roles: roles.rows,
            paginate: {
              pageSize: paginate.pageSize,
              page: paginate.page,
              totalCount: roles.count,
              pageCount: paginate.pageCount
            }
          });
      })
      .catch(error => res.status(500)
        .send(error));
    }
  },

  /**
   * Create a role
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {Object} - Returns response object
   */
  create(req, res) {
    Role.create(req.body)
    .then(role => res.status(201)
      .send(role))
    .catch(error => Response.queryFail(res, 400, error));
  },

   /**
   * Get a particular role
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {Object} - Returns response object
   */
  find(req, res) {
    Role.findById(req.params.id)
      .then((role) => {
        if (!role) {
          return Response
            .notFound(res, `Role with id: ${req.params.id} not found.`);
        }
        res.status(200)
          .send(role);
      })
      .catch(error => res.status(500)
        .send(error));
  },

  /**
   * Update a particular role
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {Object} - Returns response object
   */
  update(req, res) {
    req.role.update(req.body)
      .then(updatedRole => res.status(200)
        .send(updatedRole))
      .catch(error => res.status(400)
        .send(error));
  },

  /**
   * Delete a particular role
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {Object} - Returns response object
   */
  destroy(req, res) {
    req.role.destroy()
      .then(() => res.status(200)
        .send({ message: 'Role deleted successfully.' }))
      .catch(error => res.status(500)
        .send(error));
  }
};

export default Roles;
