import supertest from 'supertest';
import should from 'should';
import db from '../../server/models';
import app from '../../server';
import testData from './helpers/specHelper';

const server = supertest.agent(app);
let token, adminToken, userId, adminId;

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
          done();
        });
    });
  });

  describe('Find', () => {
    it('get document Get /documents/:id', (done) => {
      server.get('/documents/1')
      .set({ 'x-access-token': token })
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

    it(`should return all documents for a particular user 
    GET users/:id/documents`, (done) => {
      server.get('/users/1/documents')
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.documents.should.be.a.Array();
          done();
        });
    });
  });
});
