import supertest from 'supertest';
import should from 'should';
import app from '../../../server';
import userData from '../helpers/specHelper';
import db from '../../models';

const server = supertest.agent(app);
let token, adminToken, thirdToken, userId, secondId, thirdId, adminId;

describe('Users', () => {
  before((done) => {
    db.User.create(userData.admin)
    .then(() => {
      server.post('/login')
      .send(userData.admin)
      .end((err, res) => {
        adminToken = res.body.token;
        adminId = res.body.user.id;
        done();
      });
    });
  });

  after((done) => {
    db.User.destroy({ where: {} });
    done();
  });

  describe('on signup', () => {
    it('should create a new user with valid attributes', (done) => {
      server.post('/users')
      .send(userData.regular)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          should(res.body).have.property('token');
          should(res.body).have.property('user');
          token = res.body.token;
          userId = res.body.user.id;
        });
      server.post('/users')
      .send(userData.regular2)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          should(res.body).have.property('token');
          should(res.body).have.property('user');
          secondId = res.body.user.id;
        });
      server.post('/users')
      .send(userData.regular7)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          should(res.body).have.property('token');
          should(res.body).have.property('user');
          thirdId = res.body.user.id;
          thirdToken = res.body.token;
          done();
        });
    });

    it('should ensure unique a user is created each time', (done) => {
      server.post('/users')
      .send(userData.regular)
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          res.body.message.should.equal('Sorry, username already exists.');
          res.status.should.equal(400);
          done();
        });
    });

    it('should not allow a user sign up as an admin', (done) => {
      userData.regular.roleId = 1;
      server.post('/users')
      .send(userData.regular)
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.message.should.equal('You can\'t sign up as an admin.');
          done();
        });
    });

    it('should not allow a user pass in an id as part of request body',
    (done) => {
      userData.regular.id = 5;
      server.post('/users')
      .send(userData.regular)
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.message.should.equal('Sorry, You can\'t pass an id.');
          done();
        });
    });

    it('should fail when all parameters are not given', (done) => {
      server.post('/users')
      .send(userData.invalidEmail)
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          should(res.body).have.property('message');
          res.body.message.should.equal('Email address is invalid');
          done();
        });
    });

    it('should fail if password length is less than 6 characters', (done) => {
      server.post('/users')
      .send(userData.badPassword)
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

  describe('Create user by Admin', () => {
    it('should create a new user with valid attributes', (done) => {
      server.post('/users/create')
      .send(userData.createdByAdmin)
      .set({ 'x-access-token': adminToken })
        .expect('Content-Type', /json/)
        .end((err, res) => {
          should(res.status).equal(201);
          should(res.body).not.have.property('token');
          should(res.body).have.property('user');
          done();
        });
    });

    it('should create a new user with valid attributes', (done) => {
      server.post('/users/create')
      .send(userData.adminCreatedByAdmin)
      .set({ 'x-access-token': adminToken })
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          should(res.body).not.have.property('token');
          should(res.body).have.property('user');
          should(res.body.user.roleId).equal(1);
          done();
        });
    });

    it('should not allow a regular user create a user', (done) => {
      server.post('/users/create')
      .send(userData.createdByAdmin)
      .set({ 'x-access-token': token })
        .expect('Content-Type', /json/)
        .expect(403)
        .end((err, res) => {
          res.status.should.equal(403);
          res.body.message.should.equal('You are not authorized!');
          done();
        });
    });
  });

  describe('on login', () => {
    it('should give token to created users', (done) => {
      server.post('/login')
      .send(userData.regular)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          should(res.body).have.property('token');
          token = res.body.token;
          done();
        });
    });

    it('should return error message if username and password do not match.',
    (done) => {
      server.post('/login')
      .send({
        username: userData.regular.username,
        password: 'password12345'
      })
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.should.have.property('message');
          res.body.message.should
          .equal('Incorrect username and password combination!');
          done();
        });
    });

    it('should return an error for a user yet to be created', (done) => {
      server.post('/login')
      .send(userData.regular5)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.status.should.equal(404);
          res.body.should.have.property('message');
          res.body.message.should.equal('User does not exist.');
          done();
        });
    });
  });

  describe('edit user ', () => {
    const newAttributes = {
      firstName: 'John', lastName: 'Doe', email: 'johndoe@mail.com'
    };
    const newAttributes2 = {
      firstName: 'newJohn', lastName: 'newDoe', roleId: 1
    };
    let updatedUser;

    it('should update the user attributes', (done) => {
      server.put(`/users/${userId}`)
        .set({ 'x-access-token': token })
        .send(newAttributes)
        .end((err, res) => {
          res.status.should.equal(200);
          should(res.body.updatedUser.lastName)
            .be
            .exactly(newAttributes.lastName);
          should(res.body.updatedUser.firstName)
            .be
            .exactly(newAttributes.firstName);
          should(res.body.updatedUser.email)
            .be
            .exactly(newAttributes.email);
          done();
        });
    });

    it('should allow an admin update only roles of other users', (done) => {
      server.put(`/users/${userId}`)
        .set({ 'x-access-token': adminToken })
        .send(newAttributes2)
        .end((err, res) => {
          res.status.should.equal(200);
          should(res.body.updatedUser.roleId)
            .be
            .exactly(newAttributes2.roleId);

          updatedUser = res.body.updatedUser;
          done();
        });
    });

    it(`should not allow an admin update other users attributes 
    other than role id`, (done) => {
      should(updatedUser.firstName)
        .not
        .exactly(newAttributes2.firstName);
      should(updatedUser.lastName)
        .not
        .exactly(newAttributes2.lastName);
      done();
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
      server.put(`/users/${userId}`)
        .set({ 'x-access-token': thirdToken })
        .send(newAttributes)
        .expect(401)
        .end((err, res) => {
          res.status.should.equal(403);
          should(res.body).have.property('message');
          should(res.body.message)
            .equal('You are restricted from performing this action.');
          done();
        });
    });

    it('should allow a user not logged in to perform update.', (done) => {
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
          res.body.users.rows.should.be.Array();
          res.body.users.count.should.equal(6);
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

    it('should return users based on pagination', (done) => {
      server.get('/users?limit=2&offset=3')
        .set({ 'x-access-token': token })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.users.rows.should.be.Array();
          res.body.metaData.totalPages.should.equal(3);
          res.body.metaData.currentPage.should.equal(2);
          res.body.users.rows.length.should.equal(2);
          res.body.users.count.should.equal(6);
          done();
        });
    });
  });

  describe('Find user', () => {
    it('get a user by it\'s id', (done) => {
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

  describe('Delete user', () => {
    it('should not allow a regular user delete an admin account',
    (done) => {
      server.delete(`/users/${adminId}`)
        .set({ 'x-access-token': thirdToken })
        .end((err, res) => {
          res.status.should.equal(403);
          res.body.message.should
            .equal('You are restricted from performing this action.');
          done();
        });
    });

    it('should not allow a regular user delete other user\'s account',
    (done) => {
      server.delete(`/users/${userId}`)
        .set({ 'x-access-token': thirdToken })
        .end((err, res) => {
          res.status.should.equal(403);
          res.body.message.should
            .equal('You are restricted from performing this action.');
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
      server.delete(`/users/${thirdId}`)
        .set({ 'x-access-token': thirdToken })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.message.should.equal('User deleted successfully.');
          done();
        });
    });

    it('should allow an admin delete any account', (done) => {
      server.delete(`/users/${secondId}`)
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
        .expect(404)
        .end((err, res) => {
          res.body.message.should.equal('User Not found.');
          done();
        });
    });

    it('should return not authenticated for user not logged in.',
    (done) => {
      server.delete(`/users/${userId}`)
        .expect(401)
        .end((err, res) => {
          res.body.message.should
          .equal('Authentication is required. No token provided.');
          done();
        });
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
