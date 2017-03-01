import should from 'should';
import db from '../../models';
import testData from '../helpers/specHelper';

describe('Document Model', () => {
  let userDocument;
  let regularUser;
  const requiredFields = ['title', 'content'];
  const emptyFields = ['title', 'content', 'access'];

  before((done) => {
    db.User.create(testData.regularUser8)
      .then((user) => {
        regularUser = user.dataValues;
        done();
      });
  });
  after((done) => { db.User.destroy({ where: {} }); done(); });

  describe('Create Document', () => {
    it('should create document', (done) => {
      testData.document4.ownerRoleId = regularUser.roleId;
      testData.document4.ownerId = regularUser.id;
      db.Document.create(testData.document4)
        .then((doc) => {
          userDocument = doc.dataValues;
          should(doc.title).equal(testData.document4.title);
          should(doc.content).equal(testData.document4.content);
          should(doc).have.property('createdAt');
          should(doc.ownerId).equal(regularUser.id);
          done();
        });
    });
  });

  describe('Not Null Violation', () => {
    requiredFields.forEach((field) => {
      it('should return not null Violation message', (done) => {
        const notNull = Object.assign({}, testData.document4);
        notNull[field] = null;
        db.Document.create(notNull)
          .then()
          .catch((error) => {
            should(error.errors[0].message).equal(`${field} cannot be null`);
            should(error.errors[0].type).equal('notNull Violation');
            should(error.errors[0].path).equal(field);
            should(error.errors[0].value).equal(null);
            done();
          });
      });
    });
  });

  describe('Empty String', () => {
    emptyFields.forEach((field) => {
      it('should return error if field is empty', (done) => {
        const emptyString = Object.assign({}, testData.document4);
        emptyString[field] = ' ';
        db.Document.create(emptyString)
          .then()
          .catch((error) => {
            if (field !== 'access') {
              should(error.errors[0].message)
              .equal(`${field} cannot be empty.`);
            }
            done();
          });
      });
    });
  });

  describe('Access Violation', () => {
    it('should return error when access is not public or private',
    (done) => {
      const invalidAccess = Object.assign({}, testData.document4);
      invalidAccess.access = 'andela';
      db.Document.create(invalidAccess)
        .then()
        .catch((error) => {
          should(error.errors[0].message)
          .equal('access can only be public or private.');
          should(error.errors[0].path).equal('access');
          done();
        });
    });
  });

  describe('Update Document', () => {
    let newDocument;
    beforeEach((done) => {
      db.Document.findById(userDocument.id)
        .then((doc) => {
          doc.update({ title: 'new andela book' })
            .then((updatedDocument) => {
              newDocument = updatedDocument;
              done();
            });
        });
    });
    it('should give the correct result', (done) => {
      db.Document.findById(userDocument.id)
        .then((doc) => {
          should(doc.id).equal(newDocument.id);
          should(doc.title).equal('new andela book');
          should(doc.content).equal(userDocument.content);
          should(doc.access).equal(userDocument.access);
          should(doc.ownerId).equal(userDocument.ownerId);
          done();
        });
    });
  });
});
