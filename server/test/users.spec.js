import supertest from 'supertest';
import expect from 'expect';
import should from 'should';
import db from '../../server/models';
import app from '../../server';
import testData from './helpers/specHelper';

const server = supertest.agent(app);
let token;
let adminToken;
let userId;
let adminId;

describe('Users', () => {
  describe('on signup', () => {
    it('Should create a new user with valid attributes', (done) => {
      server.post('/users')
      .send(testData.regularUser)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          should(res.body).have.property('token');
          token = res.body.token;
          userId = res.body.userId;
        });
      server.post('/users')
      .send(testData.adminUser)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          should(res.body).have.property('token');
          adminToken = res.body.token;
          adminId = res.body.userId;
          done();
        });
    });

    it('ensures unique user is created each time', (done) => {
      server.post('/users')
      .send(testData.regularUser)
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          res.status.should.equal(400);
          done();
        });
    });

    it('should fail when all parameters are not given', (done) => {
      server.post('/users')
      .send(testData.badUser)
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          res.status.should.equal(400);
          should(res.body).have.property('error');
          done();
        });
    });
  });
  describe('on login', () => {
    it('should give token to valid users', (done) => {
      server.post('/login')
      .send(testData.regularUser)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          should(res.body).have.property('token');
          done();
        });
    });
    it('should throw an error for invalid users', (done) => {
      server.post('/login')
      .send(testData.regularUser2)
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          res.status.should.equal(400);
          should(res.body).have.property('error');
          done();
        });
    });
  });
  describe('edit user PUT: /users/:id', () => {
    it('updates the user attributes', (done) => {
      const newAttributes = {
        firstName: 'John', lastName: 'Doe', email: 'johndoe@mail.com'
      };
      server.put(`/users/${userId}`)
        .set({ 'x-access-token': token })
        .send(newAttributes)
        .end((err, res) => {
          res.status.should.equal(200);
          should(res.body.found.lastName).be.exactly(newAttributes.lastName);
          done();
        });
    });

    it('should return NOT FOUND for an invalid id', (done) => {
      server.put('/users/100')
        .set({ 'x-access-token': token })
        .expect(404)
        .end((err, res) => {
          res.status.should.equal(404);
          done();
        });
    });

    it(`should send an error message 
    if user is trying to update another user`, (done) => {
      server.put('/users/2')
        .set({ 'x-access-token': token })
        .expect(401)
        .end((err, res) => {
          res.status.should.equal(401);
          should(res.body).have.property('error');
          done();
        });
    });

    it('should return bad request for invalid access', (done) => {
      server.put(`/users/${userId}`)
        .expect(401)
        .end((err, res) => {
          res.status.should.equal(401);
          done();
        });
    });
  });

  describe('get all users GET: /users', () => {
    it('should return all users to an admin', (done) => {
      server.get('/users')
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          res.status.should.equal(200);
          done();
        });
    });

    it('should deny access to non admin ', (done) => {
      server.get('/users')
        .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(401);
          done();
        });
    });

    it('should deny access to a user not logged in ', (done) => {
      server.get('/users')
        .end((err, res) => {
          res.status.should.equal(401);
          done();
        });
    });
  });

  describe('Find user GET: /users/:id', () => {
    it('get a user with an id', (done) => {
      server.get(`/users/${userId}`)
        .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          should(res.body).have.property('username');
          should(res.body).have.property('firstName');
          should(res.body).have.property('lastName');
          should(res.body).have.property('email');
          should(res.body).have.property('userId');
          done();
        });
    });

    it('should return NOT FOUND for invalid id', (done) => {
      server.get('/users/100')
        .set({ 'x-access-token': token })
        .expect(404, done);
    });
  });

  describe('Delete user DELETE: /users/:id', () => {
    it('should delete own account', (done) => {
      server.delete(`/users/${userId}`)
        .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          done();
        });
    });

    it('admin should be able to  any delete account', (done) => {
      server.delete('/users/2')
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          res.status.should.equal(200);
          done();
        });
    });

    it('should return NOT FOUND for invalid id', (done) => {
      server.delete('/users/100')
        .set({ 'x-access-token': token })
        .expect(404, done);
    });

    it('should return bad request for invalid access', (done) => {
      server.delete(`/users/${userId}`)
        .expect(401, done);
    });
  });

  describe('logout GET: /logout', () => {
    it('should be able to logout', (done) => {
      server.get('/logout')
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.message.should.equal('You have successfully logged out');
          done();
        });
    });
  });
});
