/* eslint-disable no-unused-expressions */
import httpMocks from 'node-mocks-http';
import events from 'events';
import should from 'should';
import chai from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import userData from '../helpers/specHelper';
import db from '../../models';
import userMiddleware from '../../app/middleware/user';

let token;
let userId;
let adminId;
const expect = chai.expect;

const buildResponse = () =>
  httpMocks.createResponse({ eventEmitter: events.EventEmitter });

describe('User Middleware', () => {
  before((done) => {
    db.User.create(userData.admin)
      .then((user) => {
        adminId = user.id;
        token = jwt.sign({
          userId: user.id,
        }, 'secret', { expiresIn: '1hr' });

        db.User.create(userData.regular)
          .then((regularUser) => {
            userId = regularUser.id;
            done();
          });
      });
  });

  after((done) => {
    db.User.sequelize.sync({ force: true })
      .then(() => done());
  });


  describe('Create access', () => {
    it('should fail if user tries to add an id to request body.', (done) => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/users',
        body: {
          id: 8
        }
      });
      const res = buildResponse();
      res.on('end', () => {
        should(res._getData().message).equal('Sorry, You can\'t pass an id.');
        done();
      });
      userMiddleware.userCreateAccess(req, res);
    });

    it('should fail if user tries to signup as an admin.', (done) => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/users',
        body: {
          roleId: 1
        }
      });
      const res = buildResponse();
      res.on('end', () => {
        should(res._getData().message).equal('You can\'t sign up as an admin.');
        done();
      });
      userMiddleware.userCreateAccess(req, res);
    });

    it('should call the next function if user pass the right parameters',
    () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/users',
        params: {
          id: userId
        },
        headers: { 'x-access-token': token },
        decoded: { roleId: 1 }
      });
      const res = buildResponse();
      const middlewareStub = {
        next: () => {}
      };

      sinon.spy(middlewareStub, 'next');
      userMiddleware.userCreateAccess(req, res, middlewareStub.next);

      expect(middlewareStub.next).to.have.been.called;
    });
  });


  describe('Update access', () => {
    it('should fail if user id is not found', (done) => {
      const req = httpMocks.createRequest({
        method: 'PUT',
        url: '/users',
        params: {
          id: 1000
        }
      });
      const res = buildResponse();
      res.on('end', () => {
        should(res._getData().message).equal('User not found.');
        done();
      });
      userMiddleware.userUpdateAccess(req, res);
    });

    it('should fail if tries to update id', (done) => {
      const req = httpMocks.createRequest({
        method: 'PUT',
        url: '/users',
        params: {
          id: userId
        },
        decoded: {
          roleId: 1,
          userId
        },
        body: {
          id: 7
        }
      });
      const res = buildResponse();
      res.on('end', () => {
        should(res._getData().message).equal('You cannot update user id.');
        done();
      });
      userMiddleware.userUpdateAccess(req, res);
    });

    it('should fail if a user tries to update another user', (done) => {
      const req = httpMocks.createRequest({
        method: 'PUT',
        url: '/users',
        params: {
          id: adminId
        },
        decoded: {
          roleId: 2,
          userId
        }
      });

      const res = buildResponse();
      res.on('end', () => {
        should(res._getData().message)
          .equal('You are restricted from performing this action.');
        done();
      });
      userMiddleware.userUpdateAccess(req, res);
    });

    it('should call the next function if user is an admin', () => {
      const req = httpMocks.createRequest({
        method: 'PUT',
        url: '/users',
        params: {
          id: userId
        },
        headers: { 'x-access-token': token },
        decoded: { roleId: 1 }
      });
      const res = buildResponse();
      const middlewareStub = {
        next: () => {}
      };

      sinon.spy(middlewareStub, 'next');
      userMiddleware.userUpdateAccess(req, res, middlewareStub.next);

      expect(middlewareStub.next).to.have.been.called;
    });
  });

  describe('Delete access', () => {
    it('should fail if user id is not found', (done) => {
      const req = httpMocks.createRequest({
        method: 'DELETE',
        url: '/users',
        params: {
          id: 27
        }
      });
      const res = buildResponse();
      res.on('end', () => {
        should(res._getData().message).equal('User Not found.');
        done();
      });
      userMiddleware.userDeleteAccess(req, res);
    });

    it('should fail if a user tries to delete another user', (done) => {
      const req = httpMocks.createRequest({
        method: 'DELETE',
        url: '/users',
        params: {
          id: adminId
        },
        decoded: {
          roleId: 2,
          userId
        }
      });

      const res = buildResponse();
      res.on('end', () => {
        should(res._getData().message)
          .equal('You are restricted from performing this action.');
        done();
      });
      userMiddleware.userDeleteAccess(req, res);
    });

    it('should fail if user is trying to delete an admin', (done) => {
      const req = httpMocks.createRequest({
        method: 'DELETE',
        url: '/users',
        params: {
          id: adminId
        },
        decoded: {
          roleId: 1,
          adminId
        }
      });

      const res = buildResponse();
      res.on('end', () => {
        should(res._getData().message)
          .equal('You can not delete an admin!');
        done();
      });
      userMiddleware.userDeleteAccess(req, res);
    });

    it('should call the next function if user is an admin', () => {
      const req = httpMocks.createRequest({
        method: 'DELETE',
        url: '/users',
        params: {
          id: userId
        },
        headers: { 'x-access-token': token },
        decoded: { roleId: 1 }
      });
      const res = buildResponse();
      const middlewareStub = {
        next: () => {}
      };

      sinon.spy(middlewareStub, 'next');
      userMiddleware.userDeleteAccess(req, res, middlewareStub.next);

      expect(middlewareStub.next).to.have.been.called;
    });
  });

  describe('Delete access', () => {
    it('should call the next function', (done) => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/logout',
        decoded: { userId: adminId }
      });
      const res = buildResponse();

      const middlewareStub = {
        next: () => {}
      };

      sinon.spy(middlewareStub, 'next');
      userMiddleware.userDeleteAccess(req, res, middlewareStub.next);

      expect(middlewareStub.next).to.have.been.called;
      done();
    });
  });
});
