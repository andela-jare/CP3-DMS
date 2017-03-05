import express from 'express';
import users from '../controllers/users';
import Authenticate from '../middleware/authenticate';
import UserAccess from '../middleware/userMiddleware';

const user = express.Router();
user.post('/users/create',
  Authenticate.auth,
  Authenticate.permitAdmin,
  users.create);

user.post('/users', UserAccess.userCreateAccess, users.signUp);
user.post('/login', users.login);
user.post('/logout', Authenticate.auth, UserAccess.userLogout, users.logout);

user.get('/users', Authenticate.auth, users.allUsers);
user.get('/users/:id', Authenticate.auth, users.findUser);

user.put('/users/:id',
  Authenticate.auth,
  UserAccess.userUpdateAccess,
  users.update);

user.delete('/users/:id',
  Authenticate.auth,
  UserAccess.userDeleteAccess,
  users.destroy);

export default user;
