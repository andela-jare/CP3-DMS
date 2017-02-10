import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../models';

module.exports = {
  create(req, res) {
    return User.create(req.body)
    .then((user) => {
      bcrypt.compare(req.body.password, user.password, (error, result) => {
        if (error) return res.status(400).send({ error });
        const token = jwt.sign({
          message: 'signedUp',
          userId: user.id,
          roleId: user.roleId
        }, 'secret', { expiresIn: '1h' });
        res.status(201).json({
          success: true,
          message: 'You have successfully signed up!',
          token,
          userId: user.id,
          userEmail: user.email
        });
      });
    })
    .catch(error => res.status(400).send({ error }));
  },
  login(req, res) {
    return User.findOne({
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
        }, 'secret', { expiresIn: '1h' });
        return res.status(200).json({
          success: true,
          message: 'You have successfully signed in!',
          token,
          userId: user.id,
          userEmail: user.email
        });
      }
      return res.status(400).send({ message: 'error' });
    })
    .catch(error => res.status(400).send({ error }));
  },
  allUsers(req, res) {
    return User.findAll()
    .then((users) => {
      if (req.decoded.roleId !== 1) {
        return res.status(401).send({ error: 'You are not authorized!' });
      }
      res.status(200).send(users);
    })
    .catch(error => res.status(400).send({ error }));
  },
  update(req, res) {
    return User.findById(req.params.id)
      .then((user) => {
        if (!user) {
          return res.status(404).send({ error: 'User Not found' });
        } else if (Number(req.params.id) !== req.decoded.userId) {
          return res.status(401).send({ error: 'Unauthorized user' });
        }
        user.update(req.body, {
          where: {
            id: req.params.id,
          }
        })
        .then((found) => {
          res.status(200).send({ found });
        })
        .catch(error => res.status(404).send({ error }));
      })
      .catch(error => res.status(404).send({ error }));
  }
};
