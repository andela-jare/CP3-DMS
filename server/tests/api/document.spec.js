import supertest from 'supertest';
import should from 'should';
import app from '../../../server';
import userData from '../helpers/specHelper';
import db from '../../models';

const server = supertest.agent(app);
let token;
let adminToken;
let secondToken;
let userId;
let documentId1;
let documentId2;

describe('Document Api', () => {
  before((done) => {
    db.User.create(userData.regular)
    .then(() => {
      server.post('/login')
      .send(userData.regular)
      .end((err, res) => {
        token = res.body.token;
        userId = res.body.user.id;

        db.User.create(userData.admin)
        .then(() => {
          server.post('/login')
          .send(userData.admin)
          .end((err, res) => {
            adminToken = res.body.token;

            db.User.create(userData.createdByAdmin)
            .then(() => {
              server.post('/login')
              .send(userData.createdByAdmin)
              .end((err, res) => {
                secondToken = res.body.token;
                done();
              });
            });
          });
        });
      });
    });
  });

  after((done) => {
    db.User.destroy({
      where: {}
    });
    db.Document.destroy({
      where: {}
    });
    done();
  });

  describe('Create', () => {
    it('should create new document.', (done) => {
      server.post('/documents')
      .send(userData.document)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.body.should.have.property('document');
          should(res.body.document.access).equal('public');
          documentId1 = res.body.document.id;
          server.post('/documents')

          .send(userData.document2)
          .set({ 'x-access-token': secondToken })
            .end((err, res) => {
              res.body.should.have.property('document');
              should(res.body.document.access).equal('public');
              done();
            });
        });
    });

    it('should not create a document with content being null.', (done) => {
      const document = {
        title: 'Doc 1',
      };
      server.post('/documents')
      .send(document)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.should.have.property('message');
          res.body.message.should.equal('content cannot be null');
          done();
        });
    });

    it('should not create document with title being null.', (done) => {
      const document = {
        content: 'Doc 1',
      };
      server.post('/documents')
      .send(document)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.should.have.property('message');
          res.body.message.should.equal('title cannot be null');
          done();
        });
    });

    it('should not allow a user not logged in to create a document.',
    (done) => {
      server.post('/documents')
      .send(userData.privateDocument)
        .end((err, res) => {
          res.status.should.equal(401);
          should(res.body.message)
          .equal('Authentication is required. No token provided.');
          done();
        });
    });

    it('should be able to create a private document', (done) => {
      server.post('/documents')
      .send(userData.privateDocument)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.body.should.have.property('document');
          res.body.document.access.should.equal('private');
          documentId2 = res.body.document.id;
          done();
        });
    });
  });

  describe('Get a document', () => {
    it('should return a document matching an id', (done) => {
      server.get(`/documents/${documentId1}`)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.should.have.property('document');
          res.body.document.id.should.equal(documentId1);
          done();
        });
    });

    it('should return a private document to an admin', (done) => {
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
      .set({ 'x-access-token': secondToken })
        .end((err, res) => {
          res.status.should.equal(403);
          res.body.message.should.equal('You are unauthorized.');
          done();
        });
    });

    it('should return not found for a document not yet created', (done) => {
      server.get('/documents/122')
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(404);
          res.body.message.should.equal('Document not found.');
          done();
        });
    });

    it('should allow a user not logged in to get a document', (done) => {
      server.get(`/documents/${documentId2}`)
        .end((err, res) => {
          res.status.should.equal(401);
          res.body.message.should
            .equal('Authentication is required. No token provided.');
          done();
        });
    });
  });

  describe('Get Documents', () => {
    it('should return all documents a user has access to.', (done) => {
      server.get('/documents?limit=10&offset=0')
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.documents.rows.should.be.a.Array();
          should(res.body.documents.rows[0].access).equal('private');
          should(res.body.documents.count).equal(3);
          done();
        });
    });

    it('should not allow a user not logged in get documents', (done) => {
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
          res.body.documents.rows.should.be.a.Array();
          should(res.body.documents.count).equal(3);
          done();
        });
    });

    it('should return user\'s documents and other users public documents',
    (done) => {
      server.get('/documents')
      .set({ 'x-access-token': secondToken })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.documents.rows.should.be.a.Array();
          res.body.metaData.totalPages.should.equal(1);
          res.body.metaData.currentPage.should.equal(1);
          should(res.body.documents.count).equal(2);
          should(res.body.documents.rows[0].access).equal('public');
          should(res.body.documents.rows[1].access).equal('public');
          done();
        });
    });

    it('should return an error message if invalid limit query is passed',
    (done) => {
      server.get('/documents?limit=26')
      .set({ 'x-access-token': secondToken })
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
      .set({ 'x-access-token': secondToken })
        .end((err, res) => {
          res.status.should.equal(400);
          should(res.body).have.property('message');
          res.body.message.should
            .equal('Please enter a valid number starting from 0 for offset.');
          done();
        });
    });
  });

  describe('Edit Document', () => {
    it('should edit document the user has access to.', (done) => {
      server.put(`/documents/${documentId2}`)
      .send(userData.updateDocument)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          should(res.body.title)
            .be.exactly(userData.updateDocument.title);
          done();
        });
    });

    it('should return not found for a document non-existing', (done) => {
      server.put('/documents/122')
      .send(userData.updateDocument)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(404);
          res.body.message.should.equal('Document Not found.');
          done();
        });
    });

    it('should not allow a user is not logged in to update.', (done) => {
      server.put(`/documents/${documentId1}`)
      .send(userData.updateDocument)
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
      .send(userData.updateDocument2)
      .set({ 'x-access-token': secondToken })
        .end((err, res) => {
          res.status.should.equal(403);
          res.body.message.should
            .equal('You are restricted from performing this action.');
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
          res.body.documents.rows.should.be.a.Array();
          res.body.documents.count.should.equal(2);
          done();
        });
    });

    it('should return all documents for a particular user to an admin.',
    (done) => {
      server.get(`/users/${userId}/documents`)
      .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.documents.rows.should.be.a.Array();
          res.body.documents.count.should.equal(2);
          res.body.documents.rows[0].access.should.equal('public');
          res.body.documents.rows[1].access.should.equal('private');
          done();
        });
    });

    it(`should return only public documents if user is neither the owner 
    nor an admin`, (done) => {
      server.get(`/users/${userId}/documents`)
      .set({ 'x-access-token': secondToken })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.documents.rows.should.be.Array();
          res.body.documents.count.should.equal(1);
          res.body.documents.rows[0].access.should.equal('public');
          done();
        });
    });

    it('should not allow a user not logged in get documents.', (done) => {
      server.get(`/users/${userId}/documents`)
        .end((err, res) => {
          res.status.should.equal(401);
          should(res.body.message)
          .equal('Authentication is required. No token provided.');
          done();
        });
    });
  });

  describe('Paginate', () => {
    let numOfDocuments = 0;
    let totalCount = 0;

    it('should return documents based on pagination', (done) => {
      server.get(`/users/${userId}/documents?limit=1&offset=1`)
        .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.documents.rows.should.be.a.Array();
          res.body.metaData.totalPages.should.equal(2);
          res.body.metaData.currentPage.should.equal(2);
          numOfDocuments = res.body.documents.rows.length;
          totalCount = res.body.documents.count;
          done();
        });
    });

    it('should return one document given a limit of one', (done) => {
      numOfDocuments.should.equal(1);
      done();
    });

    it('should return two as the total number of documents', (done) => {
      totalCount.should.equal(2);
      done();
    });

    it('should return the first page of all pages given an offset of zero',
    (done) => {
      server.get(`/users/${userId}/documents?limit=1&offset=0`)
        .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.documents.rows.should.be.a.Array();
          res.body.documents.rows.length.should.equal(1);
          res.body.metaData.totalPages.should.equal(2);
          res.body.metaData.currentPage.should.equal(1);
          done();
        });
    });
  });

  describe('Search:', () => {
    it('should return all documents to a user where search terms are matched',
    (done) => {
      server.get('/documents/search?search=Doc 1 edit&limit=10&offset=0')
      .set({ 'x-access-token': token })
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.documents.rows.should.be.a.Array();
        should(res.body.documents.count).equal(1);
        done();
      });
    });

    it('should return paginated result.',
    (done) => {
      server.get('/documents/search?search=Doc 1 edit&limit=10&offset=0')
      .set({ 'x-access-token': token })
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.documents.rows.should.be.a.Array();
        res.body.metaData.currentPage.should.equal(1);
        res.body.metaData.totalPages.should.equal(1);
        res.body.documents.count.should.equal(1);
        done();
      });
    });

    it('should return all documents to an admin', (done) => {
      server.get('/documents/search?search=Doc 1 edit')
      .set({ 'x-access-token': adminToken })
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.documents.rows.should.be.a.Array();
        should(res.body.documents.count).equal(1);
        done();
      });
    });

    it(`should return the user's documents and public documents of other
    users where search terms are matched`,
    (done) => {
      server.get('/documents/search?search=Doc 1 edit')
      .set({ 'x-access-token': secondToken })
      .end((err, res) => {
        res.status.should.equal(404);
        res.body.message.should.equal('No results found for Doc 1 edit.');
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
          res.body.message.should.equal('Document Not found.');
          done();
        });
    });

    it('should not allow a user who is not the owner delete document',
    (done) => {
      server.delete(`/documents/${documentId2}`)
      .set({ 'x-access-token': secondToken })
        .end((err, res) => {
          res.status.should.equal(403);
          res.body.message.should
          .equal('You are restricted from performing this action.');
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
