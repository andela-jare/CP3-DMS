import controllers from '../controllers';
import Authenticate from '../middleware/authenticate';

module.exports = (app) => {
  app.route('/users')
  .post(controllers.users.create)
  .get(Authenticate.auth, controllers.users.allUsers);

  app.route('/login')
  .post(controllers.users.login);

  app.use(Authenticate.auth);

  app.route('/users/:id')
  .put(controllers.users.update);
};
