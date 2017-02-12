import { roles } from '../controllers';
import Authenticate from '../middleware/authenticate';

module.exports = (app) => {
  app.use(Authenticate.auth);

  app.route('/roles')
  .post(roles.create)
  .get(roles.index);

  app.route('/roles/id')
  .put(roles.update)
  .get(roles.find)
  .delete(roles.destroy);
};
