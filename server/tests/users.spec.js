import supertest from 'supertest';
import should from 'should';
import app from '../../server';
import db from '../models';
import testData from './helpers/specHelper';

const server = supertest.agent(app);
let token, adminToken, userToken7, userId, userId2, userId7, adminId;

describe('Users', () => {
  before((done) => {
    db.User.create(testData.adminUser)
    .then(() => {
      server.post('/login')
      .send(testData.adminUser6)
      .end((err, res) => {
        adminToken = res.body.token;
        adminId = res.body.userId;
        done();
      });
    });
  });

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
      .send(testData.regularUser2)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          should(res.body).have.property('token');
          should(res.body).have.property('userId');
          userId2 = res.body.userId;
        });
      server.post('/users')
      .send(testData.regularUser7)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          should(res.body).have.property('token');
          should(res.body).have.property('userId');
          userId7 = res.body.userId;
          userToken7 = res.body.token;
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
          should(res.body).have.property('message');
          done();
        });
    });

    it('should fail if password length is less than 6 characters', (done) => {
      server.post('/users')
      .send(testData.badUser2)
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          should(res.body).have.property('message');
          res.body.message.should
          .equal('Password must be at least 6 characters.');
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

    it('should return error message if username and password do not match.',
    (done) => {
      server.post('/login')
      .send({
        username: testData.regularUser.username,
        password: 'password12345'
      })
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.should.have.property('message');
          res.body.message.should
          .equal('Incorrect username and password combination!');
          res.body.status.should.equal(false);
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
          res.body.should.have.property('message');
          res.body.should.have.property('status');
          res.body.message.should.equal('User does not exist.');
          done();
        });
    });
  });

  describe('edit user ', () => {
    const newAttributes = {
      firstName: 'John', lastName: 'Doe', email: 'johndoe@mail.com'
    };
    it('should update the user attributes', (done) => {
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
      const newAttributes2 = {
        firstName: 'newJohn', lastName: 'newDoe', roleId: 1
      };
      server.put(`/users/${userId}`)
        .set({ 'x-access-token': adminToken })
        .send(newAttributes2)
        .end((err, res) => {
          res.status.should.equal(200);
          should(res.body.found.roleId).be.exactly(newAttributes2.roleId);
          should(res.body.found.firstName).not
          .exactly(newAttributes2.firstName);
          should(res.body.found.lastName).not.exactly(newAttributes2.lastName);
          done();
        });
    });

    it('should return NOT FOUND for an invalid id', (done) => {
      server.put('/users/100')
        .set({ 'x-access-token': token })
        .send(newAttributes)
        .expect(404)
        .end((err, res) => {
          res.status.should.equal(404);
          should(res.body.message).equal('User not found.');
          done();
        });
    });

    it(`should return not authorized message if a regular user is trying to 
    update another user`, (done) => {
      server.put(`/users/${adminId}`)
        .set({ 'x-access-token': userToken7 })
        .send(newAttributes)
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
        .send(newAttributes)
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
    it('should not allow a regular user delete other user\'s account',
    (done) => {
      server.delete(`/users/${adminId}`)
        .set({ 'x-access-token': userToken7 })
        .end((err, res) => {
          res.status.should.equal(403);
          res.body.message.should.equal('You are not authorized!');
          done();
        });
    });

    it('should not allow an admin user to be deleted', (done) => {
      server.delete(`/users/${userId}`)
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          res.status.should.equal(403);
          res.body.message.should.equal('You can not delete an admin!');
          done();
        });
    });

    it('should be able to delete own account', (done) => {
      server.delete(`/users/${userId7}`)
        .set({ 'x-access-token': userToken7 })
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
      server.post('/logout')
      .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.message.should.equal('You have successfully logged out');
          done();
        });
    });

    it('should prevent a logged out user from accessing a protected route',
    (done) => {
      server.get('/users')
      .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          res.status.should.equal(401);
          res.body.message.should
          .equal('Please sign in or register to continue.');
          done();
        });
    });
  });
});
