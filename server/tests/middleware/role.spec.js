/* eslint-disable no-unused-expressions */
import httpMocks from 'node-mocks-http';
import events from 'events';
import should from 'should';
import chai from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import userData from '../helpers/specHelper';
import db from '../../models';
import RoleMiddleware from '../../app/middleware/role';

let token;
let userId;
let adminId;
let newRoleId;
const expect = chai.expect;

const buildResponse = () =>
  httpMocks.createResponse({ eventEmitter: events.EventEmitter });

describe('Role Middleware', () => {
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

            userData.document.ownerId = adminId;
            db.Role.create(userData.newRole1)
              .then((role) => {
                newRoleId = role.id;
                done();
              });
          });
      });
  });

  after((done) => {
    db.User.destroy({
      where: {}
    });
    done();
  });


  describe('Find Role', () => {
    it('should fail if role is not found.', (done) => {
      const req = httpMocks.createRequest({
        method: 'PUT',
        url: '/roles',
        params: {
          id: 78
        }
      });
      const res = buildResponse();
      res.on('end', () => {
        should(res._getData().message)
          .equal(`Role with id: ${req.params.id} not found.`);
        done();
      });
      RoleMiddleware.findRole(req, res);
    });

    it('should fail if an admin tries to perform an action on admin role.',
    (done) => {
      const req = httpMocks.createRequest({
        method: 'PUT',
        url: '/roles',
        params: {
          id: 1
        },
        decoded: {
          roleId: 1,
          userId
        }
      });
      const res = buildResponse();
      res.on('end', () => {
        should(res._getData().message)
          .equal('You cannot perform any action on admin or regular role.');
        done();
      });
      RoleMiddleware.findRole(req, res);
    });

    it('should fail if an admin tries to perform an action on regular role.',
    (done) => {
      const req = httpMocks.createRequest({
        method: 'PUT',
        url: '/roles',
        params: {
          id: 2
        },
        decoded: {
          roleId: 1,
          userId
        }
      });
      const res = buildResponse();
      res.on('end', () => {
        should(res._getData().message)
          .equal('You cannot perform any action on admin or regular role.');
        done();
      });
      RoleMiddleware.findRole(req, res);
    });

    it('should call the next function',
    () => {
      const req = httpMocks.createRequest({
        method: 'PUT',
        url: '/roles',
        params: {
          id: newRoleId
        },
        headers: { 'x-access-token': token },
        decoded: { roleId: 1 }
      });
      const res = buildResponse();
      const middlewareStub = {
        next: () => {}
      };

      sinon.spy(middlewareStub, 'next');
      RoleMiddleware.findRole(req, res, middlewareStub.next);

      expect(middlewareStub.next).to.have.been.called;
    });
  });
});
