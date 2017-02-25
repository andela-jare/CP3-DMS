import supertest from 'supertest';
import should from 'should';
import app from '../../server';
import testData from './helpers/specHelper';

const server = supertest.agent(app);
let token, adminToken, userId, userId2, adminId;

describe('Users', () => {
  describe('on signup', () => {
    it('should create a new user with valid attributes', (done) => {
      server.post('/users')
      .send(testData.regularUser)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          should(res.body).have.property('token');
          should(res.body).have.property('userId');
          token = res.body.token;
          userId = res.body.userId;
        });
      server.post('/users')
      .send(testData.adminUser)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          should(res.body).have.property('token');
          should(res.body).have.property('userId');
          adminToken = res.body.token;
          adminId = res.body.userId;
        });
      server.post('/users')
      .send(testData.regularUser2)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          should(res.body).have.property('token');
          should(res.body).have.property('userId');
          userId2 = res.body.userId;
          done();
        });
    });

    it('should ensure unique a user is created each time', (done) => {
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
          should(res.body).have.property('error');
          done();
        });
    });
  });

  describe('on login', () => {
    it('should give token to created users', (done) => {
      server.post('/login')
      .send(testData.regularUser)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          should(res.body).have.property('token');
          done();
        });
    });

    it('should return an error for a user yet to be created', (done) => {
      server.post('/login')
      .send(testData.regularUser5)
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          res.status.should.equal(400);
          should(res.body).have.property('error');
          done();
        });
    });
  });

  describe('edit user ', () => {
    it('should update the user attributes', (done) => {
      const newAttributes = {
        firstName: 'John', lastName: 'Doe', email: 'johndoe@mail.com'
      };
      server.put(`/users/${userId}`)
        .set({ 'x-access-token': token })
        .send(newAttributes)
        .end((err, res) => {
          res.status.should.equal(200);
          should(res.body.found.lastName).be.exactly(newAttributes.lastName);
          should(res.body.found.firstName).be.exactly(newAttributes.firstName);
          should(res.body.found.email).be.exactly(newAttributes.email);
          done();
        });
    });

    it('should allow an admin update only roles', (done) => {
      const newAttributes = {
        firstName: 'newJohn', lastName: 'newDoe', roleId: 1
      };
      server.put(`/users/${userId}`)
        .set({ 'x-access-token': adminToken })
        .send(newAttributes)
        .end((err, res) => {
          res.status.should.equal(200);
          should(res.body.found.roleId).be.exactly(newAttributes.roleId);
          should(res.body.found.firstName).not.exactly(newAttributes.firstName);
          should(res.body.found.lastName).not.exactly(newAttributes.lastName);
          done();
        });
    });

    it('should return NOT FOUND for an invalid id', (done) => {
      server.put('/users/100')
        .set({ 'x-access-token': token })
        .expect(404)
        .end((err, res) => {
          res.status.should.equal(404);
          should(res.body.message).equal('User not found.');
          done();
        });
    });

    it('should send an error message if user is trying to update another user',
    (done) => {
      server.put(`/users/${adminId}`)
        .set({ 'x-access-token': token })
        .expect(401)
        .end((err, res) => {
          res.status.should.equal(403);
          should(res.body).have.property('message');
          should(res.body.message).equal('You are not authorized.');
          done();
        });
    });

    it('should return unauthorized for a user not logged in.', (done) => {
      server.put(`/users/${userId}`)
        .expect(401)
        .end((err, res) => {
          res.status.should.equal(401);
          should(res.body.message)
          .equal('Authentication is required. No token provided.');
          done();
        });
    });
  });

  describe('Get users', () => {
    it('should return all users', (done) => {
      server.get('/users')
        .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.should.be.Array();
          should(res.body[0]).have.property('username');
          should(res.body[0]).have.property('firstName');
          should(res.body[0]).have.property('lastName');
          should(res.body[0]).have.property('email');
          should(res.body[0]).have.property('id');
          should(res.body[0]).not.have.property('password');
          done();
        });
    });

    it('should deny access to a user not logged in ', (done) => {
      server.get('/users')
        .end((err, res) => {
          res.status.should.equal(401);
          should(res.body.message)
          .equal('Authentication is required. No token provided.');
          done();
        });
    });
  });

  describe('Find user', () => {
    it('get a user with an id', (done) => {
      server.get(`/users/${userId}`)
        .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          should(res.body).have.property('username');
          should(res.body).have.property('firstName');
          should(res.body).have.property('lastName');
          should(res.body).have.property('email');
          should(res.body).have.property('id');
          should(res.body).not.have.property('password');
          done();
        });
    });

    it('should return NOT FOUND for non existing user id', (done) => {
      server.get('/users/100')
        .set({ 'x-access-token': token })
        .expect(404)
        .end((err, res) => {
          should(res.body.message).equal('User not found.');
          done();
        });
    });
  });

  describe('Delete user', () => {
    it('should allow a regular user delete other user\'s account', (done) => {
      server.delete(`/users/${adminId}`)
        .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(403);
          res.body.message.should.equal('You are not authorized!');
          done();
        });
    });

    it('should be able to delete own account', (done) => {
      server.delete(`/users/${userId}`)
        .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.message.should.equal('User deleted successfully.');
          done();
        });
    });

    it('should allow an admin delete any account', (done) => {
      server.delete(`/users/${userId2}`)
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.message.should.equal('User deleted successfully.');
          done();
        });
    });

    it('should return NOT FOUND status code for an invalid user id',
    (done) => {
      server.delete('/users/100')
        .set({ 'x-access-token': token })
        .expect(404, done);
    });

    it('should return not authenticated status for user not logged in.',
    (done) => {
      server.delete(`/users/${userId}`)
        .expect(401, done);
    });
  });

  describe('logout', () => {
    it('should be able to logout', (done) => {
      server.get('/logout')
      .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.message.should.equal('You have successfully logged out');
          done();
        });
    });
  });
});
