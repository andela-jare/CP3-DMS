import supertest from 'supertest';
import should from 'should';
import app from '../../server';
import testData from './helpers/specHelper';

const server = supertest.agent(app);
let token, adminToken, user4Token, userId, documentId1, documentId2;

describe('Document Api', () => {
  before((done) => {
    server.post('/users')
      .send(testData.regularUser3)
      .end((err, res) => {
        token = res.body.token;
        userId = res.body.userId;
      });
    server.post('/users')
      .send(testData.adminUser3)
      .end((err, res) => {
        adminToken = res.body.token;
      });
    server.post('/users')
      .send(testData.regularUser4)
      .end((err, res) => {
        user4Token = res.body.token;
        done();
      });
  });

  describe('Create', () => {
    it('should create new document.', (done) => {
      server.post('/documents')
      .send(testData.document)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.body.should.have.property('document');
          should(res.body.document.access).equal('public');
          documentId1 = res.body.document.id;
          done();
        });
    });

    it('should not create document with null field(s).', (done) => {
      const doc = {
        title: 'Doc 1',
      };
      server.post('/documents')
      .send(doc)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.should.have.property('message');
          res.body.message.should.equal('content cannot be null');
          done();
        });
    });

    it('should send an error message for a user not logged in.', (done) => {
      server.post('/documents')
      .send(testData.document2)
        .end((err, res) => {
          res.status.should.equal(401);
          should(res.body.message)
          .equal('Authentication is required. No token provided.');
          done();
        });
    });

    it('should be able to create a private document', (done) => {
      server.post('/documents')
      .send(testData.document2)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.body.should.have.property('document');
          should(res.body.document.access).equal('private');
          documentId2 = res.body.document.id;
          done();
        });
    });
  });

  describe('Get a document', () => {
    it('should return document', (done) => {
      server.get(`/documents/${documentId1}`)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.should.have.property('document');
          done();
        });
    });

    it('should return a private document for an admin', (done) => {
      server.get(`/documents/${documentId2}`)
      .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.document.access.should.equal('private');
          done();
        });
    });

    it(`should not return private document to a user 
    who does NOT own the document`, (done) => {
      server.get(`/documents/${documentId2}`)
      .set({ 'x-access-token': user4Token })
        .end((err, res) => {
          res.status.should.equal(403);
          res.body.message.should.equal('You are unauthorized.');
          done();
        });
    });

    it('should return not found for a document not created', (done) => {
      server.get('/documents/122')
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(404);
          res.body.message.should.equal('Document not found.');
          done();
        });
    });
  });

  describe('Get Documents', () => {
    it('should return all documents the user has access to.', (done) => {
      server.get('/documents?limit=10&offset=0')
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.document.should.be.a.Array();
          should(res.body.document[0].access).equal('private');
          should(res.body.document.length).equal(2);
          done();
        });
    });

    it('should return error message for a user not logged in', (done) => {
      server.get('/documents')
        .end((err, res) => {
          res.status.should.equal(401);
          should(res.body.message)
          .equal('Authentication is required. No token provided.');
          done();
        });
    });

    it('should return all documents to an admin', (done) => {
      server.get('/documents')
      .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.document.should.be.a.Array();
          should(res.body.document.length).equal(2);
          done();
        });
    });

    it('should return user\'s documents and other users public documents',
    (done) => {
      server.get('/documents')
      .set({ 'x-access-token': user4Token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.document.should.be.a.Array();
          should(res.body.document.length).equal(1);
          should(res.body.document[0].access).equal('public');
          done();
        });
    });

    it('should return an error message if invalid limit query is passed',
    (done) => {
      server.get('/documents?limit=26')
      .set({ 'x-access-token': user4Token })
        .end((err, res) => {
          res.status.should.equal(400);
          should(res.body).have.property('message');
          res.body.message.should
          .equal('Enter a valid number for limit within the range 1 - 10.');
          done();
        });
    });

    it('should return an error message if invalid offset query is passed',
    (done) => {
      server.get('/documents?offset=-1')
      .set({ 'x-access-token': user4Token })
        .end((err, res) => {
          res.status.should.equal(400);
          should(res.body).have.property('message');
          res.body.message.should
          .equal('Enter a valid number for offset within the range 1 - 10.');
          done();
        });
    });
  });

  describe('Edit Document', () => {
    const updateDocument = {
      title: 'Doc 1 edit',
    };
    const updateDocument2 = {
      title: 'Not valid',
    };
    it('should edit document the user has access to.', (done) => {
      server.put(`/documents/${documentId2}`)
      .send(updateDocument)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          should(res.body.title).be.exactly(updateDocument.title);
          done();
        });
    });

    it('should return not found for a document non-existing', (done) => {
      server.put('/documents/122')
      .send(updateDocument)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(404);
          res.body.message.should.equal('Document Not found.');
          done();
        });
    });

    it('should return error message if user is not authorized', (done) => {
      server.put(`/documents/${documentId1}`)
      .send(updateDocument)
        .end((err, res) => {
          res.status.should.equal(401);
          should(res.body.message)
          .equal('Authentication is required. No token provided.');
          done();
        });
    });

    it('should return error message if user is not the owner of the document',
    (done) => {
      server.put(`/documents/${documentId1}`)
      .send(updateDocument2)
      .set({ 'x-access-token': user4Token })
        .end((err, res) => {
          res.status.should.equal(403);
          res.body.message.should
          .equal('You are not allowed to edit this document.');
          done();
        });
    });
  });

  describe('User\'s document', () => {
    it('should return all documents to the owner.', (done) => {
      server.get(`/users/${userId}/documents`)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.documents.should.be.a.Array();
          res.body.documents.length.should.equal(2);
          done();
        });
    });

    it('should return all documents for a particular user to an admin.',
    (done) => {
      server.get(`/users/${userId}/documents`)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.documents.should.be.a.Array();
          res.body.documents.length.should.equal(2);
          res.body.documents[0].access.should.equal('public');
          res.body.documents[1].access.should.equal('private');
          done();
        });
    });

    it('should return error if user is neither the owner of the id or an admin',
    (done) => {
      server.get(`/users/${userId}/documents`)
      .set({ 'x-access-token': user4Token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.documents.should.be.a.Array();
          res.body.documents.length.should.equal(1);
          res.body.documents[0].access.should.equal('public');
          done();
        });
    });

    it('should return error message if user is not logged in.', (done) => {
      server.get(`/users/${userId}/documents`)
        .end((err, res) => {
          res.status.should.equal(401);
          should(res.body.message)
          .equal('Authentication is required. No token provided.');
          done();
        });
    });
  });

  describe('Search:', () => {
    it('should return all documents for user where search terms are matched',
    (done) => {
      server.get('/documents/search?search=Doc 1 edit&limit=10&offset=0')
      .set({ 'x-access-token': token })
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.be.a.Array();
        should(res.body.length).equal(1);
        done();
      });
    });

    it('should return all documents to an admin', (done) => {
      server.get('/documents/search?search=Doc 1 edit')
      .set({ 'x-access-token': adminToken })
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.be.a.Array();
        should(res.body.length).equal(1);
        done();
      });
    });

    it(`should return the user's documents and public documents of other
    users where search terms are matched`, (done) => {
      server.get('/documents/search?search=Doc 1 edit')
      .set({ 'x-access-token': user4Token })
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.be.a.Array();
        should(res.body.length).equal(0);
        done();
      });
    });
  });

  describe('Delete', () => {
    it('should delete user document', (done) => {
      server.delete(`/documents/${documentId1}`)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.message.should.equal('Document successfully deleted!');
          done();
        });
    });

    it('should return not found for a document not created', (done) => {
      server.delete('/documents/122')
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(404);
          res.body.message.should.equal('Document Not found');
          done();
        });
    });

    it('user who is not the owner should not be able to delete document',
    (done) => {
      server.delete(`/documents/${documentId2}`)
      .set({ 'x-access-token': user4Token })
        .end((err, res) => {
          res.status.should.equal(403);
          res.body.message.should
          .equal('This document does not belong to you.');
          done();
        });
    });

    it('admin should be able to delete any document', (done) => {
      server.delete(`/documents/${documentId2}`)
      .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.message.should.equal('Document successfully deleted!');
          done();
        });
    });

    it('should return error message if user is not logged in.', (done) => {
      server.delete(`/documents/${documentId1}`)
        .end((err, res) => {
          res.status.should.equal(401);
          should(res.body.message)
          .equal('Authentication is required. No token provided.');
          done();
        });
    });
  });
});
