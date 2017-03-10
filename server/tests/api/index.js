import supertest from 'supertest';
import should from 'should';
import app from '../../../server';

const server = supertest.agent(app);

describe('Index', () => {
  it('should return a welcome message at index endpoint',
  (done) => {
    server.get('/')
      .end((err, res) => {
        should(res.body.message)
          .equal('Welcome to Document Management System!');

        done();
      });
  });
});
