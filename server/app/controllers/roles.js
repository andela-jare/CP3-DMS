import { Role } from '../../models';
import ErrorStatus from '../helper/ErrorStatus';
import Paginate from '../helper/paginate';
import utility from '../helper/utility';

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
            roles,
            metaData: {
              totalPages: paginate.totalPages,
              currentPage: paginate.currentPage
            }
          });
      });
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
    .catch(error => ErrorStatus.queryFail(res, 400, error));
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
          return res.status(404)
            .send({
              message: `Role with id: ${req.params.id} not found.`
            });
        }
        res.status(200)
          .send(role);
      });
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
        .send(updatedRole));
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
        .send({ message: 'Role deleted successfully.' }));
  }
};

export default Roles;
