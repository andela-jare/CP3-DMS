/* eslint-disable no-unused-expressions */
import httpMocks from 'node-mocks-http';
import events from 'events';
import should from 'should';
import chai from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import userData from '../helpers/specHelper';
import db from '../../models';
import documentMiddleware from '../../app/middleware/document';

let token;
let userId;
let adminId;
let documentId;
const expect = chai.expect;

const buildResponse = () =>
  httpMocks.createResponse({ eventEmitter: events.EventEmitter });

describe('Document Middleware', () => {
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

            userData.document4.ownerId = adminId;
            db.Document.create(userData.document4)
              .then((document) => {
                documentId = document.id;
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


  describe('Write access', () => {
    it('should fail if document is not found.', (done) => {
      const req = httpMocks.createRequest({
        method: 'PUT',
        url: '/documents',
        params: {
          id: 78
        }
      });
      const res = buildResponse();
      res.on('end', () => {
        should(res._getData().message).equal('Document Not found.');
        done();
      });
      documentMiddleware.documentWriteAccess(req, res);
    });

    it('should fail if user does not have permission to write to the document.',
    (done) => {
      const req = httpMocks.createRequest({
        method: 'PUT',
        url: '/documents',
        params: {
          id: documentId
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
      documentMiddleware.documentWriteAccess(req, res);
    });

    it('should fail if user does not have permission to write to the document.',
    (done) => {
      const req = httpMocks.createRequest({
        method: 'PUT',
        url: '/documents',
        params: {
          id: documentId
        },
        decoded: {
          roleId: 1,
          userId
        },
        body: {
          ownerId: 8
        }
      });
      const res = buildResponse();
      res.on('end', () => {
        should(res._getData().message)
          .equal('You cannot update ownerId.');
        done();
      });
      documentMiddleware.documentWriteAccess(req, res);
    });

    it('should call the next function if user pass the right parameters',
    () => {
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

      documentMiddleware.documentWriteAccess(req, res, middlewareStub.next);
      expect(middlewareStub.next).to.have.been.called;
    });
  });

  describe('Search Middleware', () => {
    it('should call the next function', () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/documents/search',
        query: {
          search: 'file'
        },
        headers: { 'x-access-token': token },
        decoded: { roleId: 1 }
      });
      const res = buildResponse();
      const middlewareStub = {
        next: () => {}
      };

      sinon.spy(middlewareStub, 'next');

      documentMiddleware.search(req, res, middlewareStub.next);
      expect(middlewareStub.next).to.have.been.called;
    });
  });
});
