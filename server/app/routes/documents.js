import express from 'express';
import documents from '../controllers/documents';
import Authenticate from '../middleware/authenticate';
import DocumentAccess from '../middleware/document';

const document = express.Router();

document.get('/documents/search',
  Authenticate.auth,
  DocumentAccess.search,
  documents.search);
document.post('/documents', Authenticate.auth, documents.create);
document.get('/documents', Authenticate.auth, documents.getDocuments);

document
  .get('/users/:id/documents', Authenticate.auth, documents.usersDocument);
document.get('/documents/:id', Authenticate.auth, documents.getDocument);

document.put('/documents/:id',
  Authenticate.auth,
  DocumentAccess.documentWriteAccess,
  documents.update);

document.delete('/documents/:id',
  Authenticate.auth,
  DocumentAccess.documentWriteAccess,
  documents.destroy);

export default document;
