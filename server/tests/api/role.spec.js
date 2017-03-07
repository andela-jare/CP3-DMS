import supertest from 'supertest';
import should from 'should';
import app from '../../../server';
import userData from '../helpers/specHelper';
import db from '../../models';

const server = supertest.agent(app);

let adminToken;
let token;
let newRoleId;
let newRoleTitle;

describe('Roles:', () => {
  before((done) => {
    db.User.create(userData.admin)
    .then(() => {
      server.post('/login')
      .send(userData.admin)
      .end((err, res) => {
        adminToken = res.body.token;
      });
    });
    db.User.create(userData.regular)
    .then(() => {
      server.post('/login')
      .send(userData.regular)
      .end((err, res) => {
        token = res.body.token;
        done();
      });
    });
  });

  after((done) => {
    db.User.destroy({
      where: {}
    });
    done();
  });

  describe('Create Role', () => {
    it('should allow an Admin create a Role',
    (done) => {
      server.post('/roles')
      .set({ 'x-access-token': adminToken })
      .send(userData.newRole1)
      .end((error, res) => {
        should(res.status).equal(201);
        newRoleId = res.body.id;
        newRoleTitle = res.body.title;
        should(newRoleTitle).equal(userData.newRole1.title);
        res.body.should.have.property('createdAt');
        done();
      });
    });

    it('should not allow DUPLICATE Role', (done) => {
      server.post('/roles')
      .set({ 'x-access-token': adminToken })
      .send(userData.newRole1)
      .end((error, res) => {
        res.status.should.equal(400);
        res.body.message.should.equal('title must be unique');
        done();
      });
    });

    it('should NOT allow any user with an INVALID token create a Role',
    (done) => {
      server.post('/roles')
      .set({ 'x-access-token': 'invalid token' })
      .send(userData.newRole2)
      .end((error, res) => {
        should(res.status).equal(401);
        res.body.message.should
          .equal('Invalid token. Login or register to continue');
        done();
      });
    });

    it('should NOT allow a Regular user create a Role',
    (done) => {
      server.post('/roles')
      .set({ 'x-access-token': token })
      .send(userData.newRole3)
      .end((error, res) => {
        res.status.should.equal(403);
        res.body.message.should.equal('You are not authorized!');
        done();
      });
    });
  });

  describe('Update Role', () => {
    it('should allow an Admin user update a role', (done) => {
      server.put(`/roles/${newRoleId}`)
      .set({ 'x-access-token': adminToken })
      .send(userData.updateRole1)
      .end((error, res) => {
        should(res.status).equal(200);
        should(res.body.title).equal(userData.updateRole1.title);
        done();
      });
    });

    it('should not allow an Admin user update admin role', (done) => {
      server.put('/roles/1')
      .set({ 'x-access-token': adminToken })
      .send(userData.updateRole1)
      .end((error, res) => {
        should(res.status).equal(403);
        res.body.message.should
          .equal('You cannot perform any action on admin or regular role.');
        done();
      });
    });

    it('should not allow an Admin user update regular role', (done) => {
      server.put('/roles/2')
      .set({ 'x-access-token': adminToken })
      .send(userData.updateRole1)
      .end((error, res) => {
        should(res.status).equal(403);
        res.body.message.should
          .equal('You cannot perform any action on admin or regular role.');
        done();
      });
    });

    it('should return not found for a non-existing role', (done) => {
      server.put(`/roles/${newRoleId + 300}`)
      .set({ 'x-access-token': adminToken })
      .send(userData.updateRole1)
      .end((error, res) => {
        should(res.status).equal(404);
        res.body.message.should
          .equal(`Role with id: ${newRoleId + 300} not found.`);
        done();
      });
    });

    it(`should not allow any User (Admin, Regular...) with an INVALID token 
    update a Role`,
    (done) => {
      server.put(`/roles/${newRoleId}`)
      .set({ 'x-access-token': 'invalid token' })
      .send(userData.updateRole1)
      .end((error, res) => {
        should(res.status).equal(401);
        res.body.message.should
          .equal('Invalid token. Login or register to continue');
        done();
      });
    });

    it('should not allow a Regular user update a Role', (done) => {
      server.put(`/roles/${newRoleId}`)
      .set({ 'x-access-token': token })
      .send(userData.updateRole1)
      .end((error, res) => {
        should(res.status).equal(403);
        res.body.message.should.equal('You are not authorized!');
        done();
      });
    });
  });

  describe('Get roles', () => {
    it('should allow an Admin get all Roles',
    (done) => {
      server.get('/roles')
      .set({ 'x-access-token': adminToken })
      .end((error, res) => {
        should(res.status).equal(200);
        res.body.roles.rows.should.be.Array();
        res.body.roles.count.should.equal(3);
        done();
      });
    });

    it('should return roles based on pagination.',
    (done) => {
      server.get('/roles?limit=1&offset=0')
      .set({ 'x-access-token': adminToken })
      .end((error, res) => {
        should(res.status).equal(200);
        res.body.roles.rows.should.be.Array();
        res.body.roles.count.should.equal(3);
        res.body.paginate.pageCount.should.equal(3);
        res.body.paginate.page.should.equal(1);
        done();
      });
    });

    it('should validate that atleast "regular" and "admin" roles exist',
    (done) => {
      server.get('/roles')
      .set({ 'x-access-token': adminToken })
      .end((error, res) => {
        should(res.status).equal(200);
        should(res.body.roles.rows[0].id).equal(1);
        should(res.body.roles.rows[0].title).equal('admin');
        should(res.body.roles.rows[1].id).equal(2);
        should(res.body.roles.rows[1].title).equal('regular');
        done();
      });
    });

    it('should NOT allow any user with an INVALID token to get all Roles',
    (done) => {
      server.get('/roles')
      .set({ 'x-access-token': 'invalid token' })
      .end((error, res) => {
        should(res.status).equal(401);
        done();
      });
    });

    it('should not allow a non-Admin user get Roles',
    (done) => {
      server.get('/roles')
      .set({ 'x-access-token': token })
      .end((error, res) => {
        should(res.status).equal(403);
        done();
      });
    });
  });

  describe('Get a Role', () => {
    it('should allow an Admin get a Role',
    (done) => {
      server.get('/roles/1')
      .set({ 'x-access-token': adminToken })
      .end((error, res) => {
        should(res.status).equal(200);
        should(res.body.title).equal('admin');
        done();
      });
    });

    it(`should return error message if an Admin tries to get a 
    non existing Role`,
    (done) => {
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
      .set({ 'x-access-token': token })
      .end((error, res) => {
        res.status.should.equal(403);
        res.body.message.should.equal('You are not authorized!');
        done();
      });
    });

    it('should allow an Admin delete a Role',
    (done) => {
      server.delete(`/roles/${newRoleId}`)
      .set({ 'x-access-token': adminToken })
      .end((error, res) => {
        should(res.status).equal(200);
        res.body.message.should.equal('Role deleted successfully.');
        done();
      });
    });

    it('should not allow an Admin User delete an admin role',
    (done) => {
      server.delete('/roles/1')
      .set({ 'x-access-token': adminToken })
      .end((error, res) => {
        should(res.status).equal(403);
        res.body.message.should
        .equal('You cannot perform any action on admin or regular role.');
        done();
      });
    });

    it('should not allow an Admin User delete a regular role',
    (done) => {
      server.delete('/roles/2')
      .set({ 'x-access-token': adminToken })
      .end((error, res) => {
        should(res.status).equal(403);
        res.body.message.should
        .equal('You cannot perform any action on admin or regular role.');
        done();
      });
    });

    it(`should return not found when an Admin User tries to delete a 
    non existing Role`,
    (done) => {
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
