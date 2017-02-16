import { documents } from '../controllers';
import Authenticate from '../middleware/authenticate';

module.exports = (app) => {
  app.route('/documents/search')
  .get(documents.search);

  app.use(Authenticate.auth);

  app.route('/documents')
  .post(documents.create)
  .get(documents.getDocuments);

  app.route('/documents/:id')
  .get(documents.getDocument)
  .put(documents.update)
  .delete(documents.destroy);

  app.route('/users/:id/documents')
  .get(documents.usersDocument);
};
