import supertest from 'supertest';
import should from 'should';
import db from '../../server/models';
import app from '../../server';
import testData from './helpers/specHelper';

const server = supertest.agent(app);
let token, adminToken, user4Token, userId,
  adminId, user4Id, documentId1, documentId2;

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
        should(res.body).have.property('token');
        adminToken = res.body.token;
        adminId = res.body.userId;
      });
    server.post('/users')
      .send(testData.regularUser4)
      .end((err, res) => {
        should(res.body).have.property('token');
        user4Token = res.body.token;
        user4Id = res.body.userId;
        done();
      });
  });

  describe('Create', () => {
    it('should create document POST /documents', (done) => {
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

    it(`should not create document with null fields 
    POST /documents`, (done) => {
      const doc = {
        title: 'Doc 1',
      };
      server.post('/documents')
      .send(doc)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          should(res.body).have.a.property('error');
          done();
        });
    });

    it(`should send an error message for a user not logged in 
    POST /documents`, (done) => {
      server.post('/documents')
      .send(testData.document2)
        .end((err, res) => {
          res.status.should.equal(401);
          done();
        });
    });

    it('should be able to make document private POST /documents', (done) => {
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

  describe('Find', () => {
    it('document Get /documents/:id', (done) => {
      server.get(`/documents/${documentId1}`)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          done();
        });
    });

    it('get document Get /documents/:id', (done) => {
      server.get(`/documents/${documentId2}`)
      .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          res.status.should.equal(200);
          done();
        });
    });

    it('get all document Get /documents', (done) => {
      server.get('/documents')
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.document.should.be.a.Array();
          should(res.body.document[1].access).equal('private');
          done();
        });
    });

    it(`documents which are public not private can be accessible by users 
    who are not the owner of the document 
    and are neither admin Get /documents`, (done) => {
      server.get('/documents')
      .set({ 'x-access-token': user4Token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.document.should.be.a.Array();
          should(res.body.document[0].access).equal('public');
          done();
        });
    });

    it(`should return error for a not logged in user 
    Get /documents`, (done) => {
      server.get('/documents')
        .end((err, res) => {
          res.status.should.equal(401);
          done();
        });
    });

    it(`should return not found for a document not created 
    GET /documents/:id`, (done) => {
      server.get('/documents/122')
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(404);
          done();
        });
    });
  });

  describe('Edit', () => {
    const doc = {
      title: 'Doc 1 edit',
    };
    const doc2 = {
      title: 'Not valid',
    };
    it('should edit document PUT /documents/:id', (done) => {
      server.put(`/documents/${documentId1}`)
      .send(doc)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          should(res.body.title).be.exactly(doc.title);
          done();
        });
    });

    it(`should return not found 
    for a document not created PUT /documents/:id`, (done) => {
      server.put('/documents/122')
      .send(doc)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(404);
          done();
        });
    });

    it(`should return error 
    if user is not authorized PUT /documents/:id`, (done) => {
      server.put(`/documents/${documentId1}`)
      .send(doc)
        .end((err, res) => {
          res.status.should.equal(401);
          done();
        });
    });

    it(`should return error 
    if user is not the owner of the document PUT /documents/:id`, (done) => {
      server.put(`/documents/${documentId1}`)
      .send(doc2)
      .set({ 'x-access-token': user4Token })
        .end((err, res) => {
          res.status.should.equal(403);
          done();
        });
    });
  });

  describe('User\'s document', () => {
    it(`should return all documents for a particular user 
    GET users/:id/documents`, (done) => {
      server.get(`/users/${userId}/documents`)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.documents.should.be.a.Array();
          done();
        });
    });

    it(`should return error if user is not authorized 
    GET users/:id/documents`, (done) => {
      server.get(`/users/${userId}/documents`)
        .end((err, res) => {
          res.status.should.equal(401);
          done();
        });
    });
  });

  describe('Delete', () => {
    it('should delete document DELETE /documents/:id', (done) => {
      server.delete(`/documents/${documentId1}`)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          done();
        });
    });

    it(`should return not found for a document not created 
    DELETE /documents/:id`, (done) => {
      server.delete('/documents/122')
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(404);
          done();
        });
    });

    it(`user who is not the owner should not be able to delete documents
    DELETE /documents/:id`, (done) => {
      server.delete(`/documents/${documentId2}`)
      .set({ 'x-access-token': user4Token })
        .end((err, res) => {
          res.status.should.equal(403);
          done();
        });
    });

    it(`admin should be able to delete documents
    DELETE /documents/:id`, (done) => {
      server.delete(`/documents/${documentId2}`)
      .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          res.status.should.equal(200);
          done();
        });
    });

    it(`should return error if user is not authorized 
    DELETE /documents/:id`, (done) => {
      server.delete(`/documents/${documentId1}`)
        .end((err, res) => {
          res.status.should.equal(401);
          done();
        });
    });
  });
});
