import { users } from '../controllers';
import Authenticate from '../middleware/authenticate';

module.exports = (app) => {
  app.route('/users')
  .post(users.create)
  .get(Authenticate.auth, users.allUsers);

  app.route('/login')
  .post(users.login);

  app.route('/logout')
  .get(users.logout);

  app.use(Authenticate.auth);

  app.route('/users/:id')
  .put(users.update)
  .get(users.findUser)
  .delete(users.destroy);
};
