import { Role } from '../../models';

export default {
  /**
   * Get all roles
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {Object} - Returns response object
   */
  index(req, res) {
    Role.findAll()
    .then(roles => res.send(roles));
  },

  /**
   * Create a role
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {Object} - Returns response object
   */
  create(req, res) {
    Role.create(req.body)
    .then(role => res.status(201).send(role))
    .catch(error => res.status(400).send({ message: error.errors[0].message }));
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
          return res.status(404).send({
            message: `Role with id: ${req.params.id} not found.`
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
  update(req, res) {
    Role.findById(req.params.id)
      .then((role) => {
        if (!role) {
          return res.status(404).send({
            message: `Role with id: ${req.params.id} not found.`,
            success: false
          });
        }
        role.update(req.body)
          .then(updatedRole => res.send(updatedRole));
      });
  },

  /**
   * Delete a particular role
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {Object} - Returns response object
   */
  destroy(req, res) {
    Role.findById(req.params.id)
      .then((role) => {
        if (!role) {
          return res.status(404).send({
            message: `Role with id: ${req.params.id} not found.`,
            status: false
          });
        }
        role.destroy()
          .then(() => res.send({ message: 'Role deleted successfully.' }));
      });
  }
};
