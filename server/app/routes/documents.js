import controllers from '../controllers';
import Authenticate from '../middleware/authenticate';

module.exports = (app) => {
  app.use(Authenticate.auth);

  app.route('/documents')
  .post(controllers.documents.create);
};
