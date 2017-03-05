import should from 'should';
import db from '../../models';
import userData from '../helpers/specHelper';

describe('Document Model', () => {
  let userDocument;
  let regularUser;
  const requiredFields = ['title', 'content'];
  const emptyFields = ['title', 'content'];

  before((done) => {
    db.User.create(userData.regular)
      .then((user) => {
        regularUser = user;
        done();
      });
  });

  after((done) => {
    db.User.destroy({ where: {} });
    done();
  });

  describe('Create Document', () => {
    it('should create document', (done) => {
      userData.document.ownerId = regularUser.id;
      db.Document.create(userData.document)
        .then((document) => {
          userDocument = document;
          should(document.title).equal(userData.document.title);
          should(document.content).equal(userData.document.content);
          should(document).have.property('createdAt');
          should(document.ownerId).equal(userData.document.ownerId);
          done();
        });
    });
  });

  describe('Not Null Violation', () => {
    requiredFields.forEach((field) => {
      it('should return not null Violation message', (done) => {
        const nullField = Object.assign({}, userData.document);
        nullField[field] = null;

        db.Document.create(nullField)
          .then()
          .catch((error) => {
            should(error.errors[0].message).equal(`${field} cannot be null`);
            done();
          });
      });
    });
  });

  describe('Empty String', () => {
    emptyFields.forEach((field) => {
      it('should return error if field is empty', (done) => {
        const emptyString = Object.assign({}, userData.document);
        emptyString[field] = '';

        db.Document.create(emptyString)
          .then()
          .catch((error) => {
            should(error.errors[0].message)
              .equal(`${field} cannot be empty.`);
            done();
          });
      });
    });
  });

  describe('Access Violation', () => {
    it('should return error when access is not public or private',
    (done) => {
      userData.document.access = 'andela';

      db.Document.create(userData.document)
        .then()
        .catch((error) => {
          should(error.errors[0].message)
            .equal('access can only be public or private.');
          done();
        });
    });
  });

  describe('Update Document', () => {
    let newDocument;
    beforeEach((done) => {
      db.Document.findById(userDocument.id)
        .then((foundDocument) => {
          foundDocument.update({ title: 'new andela book' })
            .then((updatedDocument) => {
              newDocument = updatedDocument;
              done();
            });
        });
    });

    it('should return the updated title', (done) => {
      newDocument.title.should.equal('new andela book');
      done();
    });

    it('should ensure updatedAt and createdAt is not the same', (done) => {
      newDocument.updatedAt.should.not.equal(newDocument.createdAt);
      done();
    });
  });

  describe('Delete Document', () => {
    it('should return the updated title', (done) => {
      db.Document.destroy({ where: { id: userDocument.id } })
        .then((result) => {
          result.should.equal(1);
          done();
        });
    });
  });
});
