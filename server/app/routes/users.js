import express from 'express';
import { users } from '../controllers';
import Authenticate from '../middleware/authenticate';

const user = express.Router();

user.post('/users', users.create);
user.post('/login', users.login);
user.get('/logout', users.logout);

user.get('/users', Authenticate.auth, users.allUsers);
user.get('/users/:id', Authenticate.auth, users.findUser);

user.put('/users/:id', Authenticate.auth, users.update);

user.delete('/users/:id', Authenticate.auth, users.destroy);

export default user;
