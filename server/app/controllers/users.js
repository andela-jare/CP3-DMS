import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../models';
import helper from '../middleware/helper';

export default {
  /**
   * Create a new user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} - Returns response object
   */
  create(req, res) {
    const query = helper.usersFields(req.body);
    User.create(query)
    .then((user) => {
      const token = jwt.sign({
        message: 'signedUp',
        userId: user.id,
        roleId: user.roleId
      }, process.env.SECRET, { expiresIn: '24h' });

      res.status(201)
        .send({
          message: 'You have successfully signed up!',
          token,
          user: {
            id: user.id,
            email: user.email
          }
        });
    })
    .catch(error => res.status(400)
      .send({
        message: error.errors[0].message
      }));
  },

  /**
   * Login a user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} - Returns response object
   */
  login(req, res) {
    User.findOne({
      where: {
        username: req.body.username
      }
    })
    .then((user) => {
      const correct = bcrypt.compareSync(req.body.password, user.password);
      if (correct) {
        const token = jwt.sign({
          message: 'loggedIn',
          userId: user.id,
          roleId: user.roleId
        }, process.env.SECRET, { expiresIn: '24h' });

        return user.update({ token })
        .then(() => {
          res.status(200)
            .json({
              message: 'You have successfully signed in!',
              token,
              user: {
                id: user.id,
                email: user.email
              }
            });
        });
      }

      return res.status(400)
        .send({
          message: 'Incorrect username and password combination!'
        });
    })
    .catch(() => res.status(400)
      .send({
        message: 'User does not exist.'
      }));
  },

  /**
  * logout - Logout a user
  *
  * @param  {Objec} req - Request Object
  * @param  {Object} res - Response Object
  * @returns {Object} - Returns response object
  */
  logout(req, res) {
    User.findById(req.decoded.userId)
    .then((user) => {
      user.update({ token: null })
      .then(() => res.status(200)
        .send({
          message: 'You have successfully logged out'
        }));
    })
    .catch(error => res.status(500)
      .send({ error }));
  },

  /**
   * Get all users with their fields
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  allUsers(req, res) {
    User.findAll({
      attributes: helper.findUsersAttributes()
    })
    .then((users) => {
      res.status(200)
        .send(users);
    });
  },

  /**
  * Get a specific user
  * @param {Object} req - Request object
  * @param {Object} res - Response object
  * @returns {Object} - Returns response object
  */
  findUser(req, res) {
    User.findById(req.params.id, {
      attributes: helper.findUsersAttributes()
    })
    .then((user) => {
      if (!user) {
        return res.status(404)
          .send({ message: 'User not found.' });
      }

      res.status(200)
        .send(user);
    });
  },

  /**
   * Edit and update a specific user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} - Returns response object
   */
  update(req, res) {
    let query = helper.usersFields(req.body);
    User.findById(req.params.id)
      .then((user) => {
        if (!user) {
          return res.status(404)
            .send({ message: 'User not found.' });
        } else if (helper.userOrAdmin(req.params.id, req)) {
          return res.status(403)
            .send({ message: 'You are not authorized.' });
        }

        if (helper.isAdmin(req.decoded.roleId)
        && req.decoded.userId !== user.id) {
          if (req.body.roleId) {
            query = {
              roleId: req.body.roleId
            };
          } else {
            return res.status(400)
              .send({
                message: 'No role id provided.'
              });
          }
        }

        user.update(query, {
          where: {
            id: req.params.id,
          }
        })
        .then((updatedUser) => {
          res.status(200)
            .send({ updatedUser });
        });
      })
      .catch(error => res.status(400)
        .send({ error }));
  },

  /**
   * Delete a specific user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} - Returns response object
   */
  destroy(req, res) {
    User.findById(req.params.id)
      .then((user) => {
        if (!user) {
          return res.status(404)
            .send({ error: 'User does not exist' });
        }

        if (helper.userOrAdmin(req.params.id, req)) {
          return res.status(403)
            .send({ message: 'You are not authorized!' });
        }

        if (helper.isAdmin(user.roleId)) {
          return res.status(403)
            .send({
              message: 'You can not delete an admin!'
            });
        }

        user.destroy()
        .then(() => res.status(200)
          .send({
            message: 'User deleted successfully.'
          }));
      });
  }
};
