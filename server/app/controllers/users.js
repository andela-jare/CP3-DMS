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
      res.status(201).json({
        success: true,
        message: 'You have successfully signed up!',
        token,
        userId: user.id,
        userEmail: user.email
      });
    })
    .catch(error => res.status(400).send({
      status: false,
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
        return res.status(200).json({
          success: true,
          message: 'You have successfully signed in!',
          token,
          userId: user.id,
          userEmail: user.email
        });
      }
      return res.status(400).send({
        status: false,
        message: 'Incorrect username and password combination!'
      });
    })
    .catch(error => res.status(400).send({
      status: false,
      message: 'User does not exist.',
      error: error.message
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
    return res.status(200).send({
      message: 'You have successfully logged out'
    });
  },

  /**
   * Get all users with their fields
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  allUsers(req, res) {
    User.findAll({
      attributes: [
        'id',
        'username',
        'firstName',
        'lastName',
        'email',
        'roleId',
        'createdAt',
        'updatedAt'
      ]
    })
    .then((users) => {
      res.status(200).send(users);
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
      attributes: [
        'id',
        'username',
        'firstName',
        'lastName',
        'email',
        'roleId',
        'createdAt',
        'updatedAt'
      ]
    })
    .then((user) => {
      if (!user) return res.status(404).send({ message: 'User not found.' });
      res.status(200).send(user);
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
          return res.status(404).send({ message: 'User not found.' });
        } else if (Number(req.params.id) !== req.decoded.userId
        && req.decoded.roleId !== 1
        ) {
          return res.status(403).send({ message: 'You are not authorized.' });
        }
        if (req.decoded.roleId === 1) {
          query = {
            roleId: req.body.roleId,
          };
        }
        user.update(query, {
          where: {
            id: req.params.id,
          }
        })
        .then((found) => {
          res.status(200).send({ found });
        });
      });
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
          return res.status(404).send({ error: 'User does not exist' });
        }
        if (req.decoded.roleId !== 1 && req.decoded.userId !== user.id) {
          return res.status(403).send({ message: 'You are not authorized!' });
        }
        user.destroy()
        .then(() => res.status(200).send({
          message: 'User deleted successfully.'
        }));
      });
  }
};
