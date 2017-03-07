import express from 'express';
import roles from '../controllers/roles';
import Authenticate from '../middleware/authenticate';
import RoleMiddleware from '../middleware/role';

const role = express.Router();

role.post('/', Authenticate.auth, Authenticate.permitAdmin, roles.create);
role.get('/', Authenticate.auth, Authenticate.permitAdmin, roles.index);

role.put('/:id',
  Authenticate.auth,
  Authenticate.permitAdmin,
  RoleMiddleware.findRole,
  roles.update);

role.get('/:id',
  Authenticate.auth,
  Authenticate.permitAdmin,
  roles.find);

role.delete('/:id',
  Authenticate.auth,
  Authenticate.permitAdmin,
  RoleMiddleware.findRole,
  roles.destroy);

export default role;
