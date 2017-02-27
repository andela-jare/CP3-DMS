import supertest from 'supertest';
import should from 'should';
import app from '../../server';
import db from '../models';
import testData from './helpers/specHelper';

const server = supertest.agent(app);

let adminToken, regularUserToken, newRoleId, newRoleTitle;

describe('Roles:', () => {
  before((done) => {
    db.User.create(testData.adminUser6)
    .then(() => {
      server.post('/login')
      .send(testData.adminUser6)
      .end((err, res) => {
        adminToken = res.body.token;
      });
    });
    db.User.create(testData.regularUser6)
    .then(() => {
      server.post('/login')
      .send(testData.regularUser6)
      .end((err, res) => {
        regularUserToken = res.body.token;
        done();
      });
    });
  });

  describe('Create Role', () => {
    it('should allow an Admin user with VALID token create a Role',
    (done) => {
      server.post('/roles')
      .set({ 'x-access-token': adminToken })
      .send(testData.newRole1)
      .end((error, res) => {
        should(res.status).equal(201);
        newRoleId = res.body.id;
        newRoleTitle = res.body.title;
        should(newRoleTitle).equal(testData.newRole1.title);
        done();
      });
    });

    it('should NOT allow DUPLICATE Role', (done) => {
      server.post('/roles')
      .set({ 'x-access-token': adminToken })
      .send(testData.newRole1)
      .end((error, res) => {
        res.status.should.equal(400);
        res.body.message.should.equal('title must be unique');
        done();
      });
    });

    it('should NOT allow any User with an INVALID token create a Role',
    (done) => {
      server.post('/roles')
      .set({ 'x-access-token': 'invalid token' })
      .send(testData.newRole2)
      .end((error, res) => {
        should(res.status).equal(401);
        done();
      });
    });

    it('should NOT allow a NON-Admin user create a Role',
    (done) => {
      server.post('/roles')
      .set({ 'x-access-token': regularUserToken })
      .send(testData.newRole3)
      .end((error, res) => {
        res.status.should.equal(403);
        res.body.message.should.equal('You are not authorized!');
        done();
      });
    });
  });

  describe('Update Role', () => {
    it('should allow only an Admin user update a role',
    (done) => {
      server.put(`/roles/${newRoleId}`)
      .set({ 'x-access-token': adminToken })
      .send(testData.updateRole1)
      .end((error, res) => {
        should(res.status).equal(200);
        should(res.body.title).equal(testData.updateRole1.title);
        done();
      });
    });

    it('should return not found for a non-existing role', (done) => {
      server.put(`/roles/${newRoleId + 300}`)
      .set({ 'x-access-token': adminToken })
      .send(testData.updateRole1)
      .end((error, res) => {
        should(res.status).equal(404);
        should(res.body.success).equal(false);
        res.body.message.should
        .equal(`Role with id: ${newRoleId + 300} not found.`);
        done();
      });
    });

    it(`should NOT allow any User (Admin, Regular...) with an INVALID token 
    UPDATE a Role`,
    (done) => {
      server.put(`/roles/${newRoleId}`)
      .set({ 'x-access-token': 'invalid token' })
      .send(testData.updateRole1)
      .end((error, res) => {
        should(res.status).equal(401);
        done();
      });
    });

    it('should NOT allow a NON Admin user update a Role', (done) => {
      server.put(`/roles/${newRoleId}`)
      .set({ 'x-access-token': regularUserToken })
      .send(testData.updateRole1)
      .end((error, res) => {
        should(res.status).equal(403);
        done();
      });
    });
  });

  describe('Get role', () => {
    it('should allow an Admin User with VALID token get all Roles',
    (done) => {
      server.get('/roles')
      .set({ 'x-access-token': adminToken })
      .end((error, res) => {
        should(res.status).equal(200);
        res.body.should.be.a.Array();
        res.body.length.should.equal(3);
        done();
      });
    });

    it('should validate that atleast "regular" and "admin" roles exist',
    (done) => {
      server.get('/roles')
      .set({ 'x-access-token': adminToken })
      .end((error, res) => {
        should(res.status).equal(200);
        should(res.body[0].id).equal(1);
        should(res.body[0].title).equal('admin');
        should(res.body[1].id).equal(2);
        should(res.body[1].title).equal('regular');
        done();
      });
    });

    it(`should NOT allow any User with an INVALID 
    token to get all Roles`, (done) => {
      server.get('/roles')
      .set({ 'x-access-token': 'invalid token' })
      .end((error, res) => {
        should(res.status).equal(401);
        done();
      });
    });

    it('should NOT allow a Non-Admin User get Roles',
    (done) => {
      server.get('/roles')
      .set({ 'x-access-token': regularUserToken })
      .end((error, res) => {
        should(res.status).equal(403);
        done();
      });
    });

    it('should allow an Admin User with VALID token get a Role',
    (done) => {
      server.get(`/roles/${newRoleId}`)
      .set({ 'x-access-token': adminToken })
      .end((error, res) => {
        should(res.status).equal(200);
        should(res.body.title).equal('rookie update');
        done();
      });
    });

    it('should not allow an Admin User get a non existing Role', (done) => {
      server.get(`/roles/${newRoleId + 90}`)
      .set({ 'x-access-token': adminToken })
      .end((error, res) => {
        should(res.status).equal(404);
        should(res.body.message)
        .equal(`Role with id: ${newRoleId + 90} not found.`);
        done();
      });
    });
  });

  describe('Delete Roles', () => {
    it('should NOT allow a non Admin user to delete a role', (done) => {
      server.delete(`/roles/${newRoleId}`)
      .set({ 'x-access-token': regularUserToken })
      .end((error, res) => {
        res.status.should.equal(403);
        res.body.message.should.equal('You are not authorized!');
        done();
      });
    });

    it('should allow an Admin User delete a Role',
    (done) => {
      server.delete(`/roles/${newRoleId}`)
      .set({ 'x-access-token': adminToken })
      .end((error, res) => {
        should(res.status).equal(200);
        res.body.message.should.equal('Role deleted successfully.');
        done();
      });
    });

    it(`should return not found 
    when an Admin User tries to delete a non existing Role`, (done) => {
      server.delete(`/roles/${newRoleId + 90}`)
      .set({ 'x-access-token': adminToken })
      .end((error, res) => {
        should(res.status).equal(404);
        res.body.message.should
        .equal(`Role with id: ${newRoleId + 90} not found.`);
        done();
      });
    });
  });
});
