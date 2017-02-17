import express from 'express';
import { roles } from '../controllers';
import Authenticate from '../middleware/authenticate';

const role = express.Router();

role.post('/', Authenticate.auth, Authenticate.permitAdmin, roles.create);
role.get('/', Authenticate.auth, Authenticate.permitAdmin, roles.index);

role.put('/:id', Authenticate.auth, Authenticate.permitAdmin, roles.update);
role.get('/:id', Authenticate.auth, Authenticate.permitAdmin, roles.find);
role.delete('/:id', Authenticate.auth, Authenticate.permitAdmin, roles.destroy);

export default role;
