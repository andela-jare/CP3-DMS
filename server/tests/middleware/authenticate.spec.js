import httpMocks from 'node-mocks-http';
import events from 'events';
import should from 'should';
import chai from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import userData from '../helpers/specHelper';
import db from '../../models';
import authenticate from '../../app/middleware/authenticate';

let token;
const expect = chai.expect;

const buildResponse = () =>
  httpMocks.createResponse({ eventEmitter: events.EventEmitter });

describe('Middleware', () => {
  before((done) => {
    db.User.create(userData.admin)
      .then((user) => {
        token = jwt.sign({
          userId: user.id,
        }, 'secret', { expiresIn: '1hr' });
        done();
      });
  });

  after((done) => {
    db.User.destroy({
      where: {}
    });
    done();
  });

  describe('authenticate', () => {
    it('should fail if no token is provided', (done) => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/users',
        params: {
          id: 1
        },
      });
      const res = buildResponse();
      res.on('end', () => {
        should(res._getData().message)
          .equal('Authentication is required. No token provided.');
        done();
      });
      authenticate.auth(req, res);
    });

    it('should fail if invalid token is provided', (done) => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/users',
        params: {
          id: 1
        },
        headers: { 'x-access-token': 'ufhjkhfqwy783r2-3q09rygeff809r09r3.jjf' }
      });
      const res = buildResponse();
      res.on('end', () => {
        should(res._getData().message)
          .equal('Invalid token. Login or register to continue');
        done();
      });
      authenticate.auth(req, res);
    });

    it('should call the next function if valid token is provided', (done) => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/users',
        headers: { 'x-access-token': 'token' }
      });
      const res = buildResponse();
      const middlewareStub = {
        next: () => {}
      };

      const next = sinon.spy(middlewareStub, 'next');
      authenticate.auth(req, res, middlewareStub.next);
      // expect(middlewareStub.next).to.have.been.called(done());
      // sinon.assert.calledOnce(middlewareStub.next);
      next.restore();
      expect(middlewareStub.next).to.have.been.calledOnce;
      // sinon.assert.calledOnce(middlewareStub.next);
      done();
    });
  });

  describe('permit admin', () => {
    it('should fail if user is not an admin', (done) => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/roles',
        headers: { 'x-access-token': token },
        decoded: { roleId: 2 }
      });
      const res = buildResponse();
      res.on('end', () => {
        should(res._getData().message)
          .equal('You are not authorized!');
        done();
      });
      authenticate.permitAdmin(req, res);
    });

    it('should call the next function if user is an admin', () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/roles',
        headers: { 'x-access-token': token },
        decoded: { roleId: 1 }
      });
      const res = buildResponse();
      const middlewareStub = {
        next: () => {}
      };

      sinon.spy(middlewareStub, 'next');
      authenticate.auth(req, res, middlewareStub.next);

      expect(middlewareStub.next).to.have.been.called;
    });
  });
});
