import controllers from '../controllers';
import Authenticate from '../middleware/authenticate';

module.exports = (app) => {
  app.use(Authenticate.auth);

  app.route('/documents')
  .post(controllers.documents.create)
  .get(controllers.documents.getDocuments);

  app.route('/documents/:id')
  .get(controllers.documents.getDocument)
  .put(controllers.documents.update)
  .delete(controllers.documents.destroy);

  app.route('/users/:id/documents')
  .get(controllers.documents.usersDocument);
};
