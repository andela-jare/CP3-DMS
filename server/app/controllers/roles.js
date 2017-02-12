import { Role } from '../../models';

module.exports = {
  /**
   * Get all roles
   * Route: GET: /roles
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {void} no returns
   */
  index(req, res) {
    return Role.findAll()
      .then(roles => res.send(roles));
  },

  /**
   * Create a role
   * Route: POST: /roles
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {void|Response} response object or void
   */
  create(req, res) {
    if (req.decoded.roleId === 1) {
      return Role.create(req.body)
        .then(role =>
          res.status(200).send(role)
        )
        .catch(error => res.status(400).send(error));
    }
    return res.status(403).send({ message: 'You are not authorized.' });
  },

   /**
   * Get a particular role
   * Route: GET: /roles/:id
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {void|Response} response object or void
   */
  find(req, res) {
    return Role.findById(req.params.id)
      .then((role) => {
        if (!role) {
          return res.status(404).send({
            message: `Role with id: ${req.params.id} not found.`
          });
        }
        res.send(role);
      })
      .catch(error => res.status(400).send(error));
  },

  /**
   * Update a particular role
   * Route: PUT: /roles/:id
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {Response|void} response object or void
   */
  update(req, res) {
    return Role.findById(req.params.id)
      .then((role) => {
        if (!role) {
          return res.status(404).send({
            message: `Role with id: ${req.params.id} not found.`
          });
        }
        role.update(req.body)
          .then(updatedRole => res.send(updatedRole));
      });
  },

  /**
   * Delete a particular role
   * Route: DELETE: /roles/:id
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {Response|void} response object or void
   */
  destroy(req, res) {
    return Role.findById(req.params.id)
      .then((role) => {
        if (!role) {
          return res.status(404).send({
            message: `Role with id: ${req.params.id} not found.`
          });
        }
        role.destroy()
          .then(() => res.send({ message: 'Role deleted successfully.' }));
      });
  }
};
