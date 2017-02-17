import express from 'express';
import { documents } from '../controllers';
import Authenticate from '../middleware/authenticate';

const document = express.Router();

document.get('/documents/search', Authenticate.auth, documents.search);
document.post('/documents', Authenticate.auth, documents.create);
document.get('/documents', Authenticate.auth, documents.getDocuments);

document
  .get('/users/:id/documents', Authenticate.auth, documents.usersDocument);
document.get('/documents/:id', Authenticate.auth, documents.getDocument);

document.put('/documents/:id', Authenticate.auth, documents.update);

document.delete('/documents/:id', Authenticate.auth, documents.destroy);

document.get('/documents/search', documents.search);

export default document;
