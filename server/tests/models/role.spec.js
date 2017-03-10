import should from 'should';
import db from '../../models';
import testData from '../helpers/specHelper';

describe('ROLE', () => {
  let newRole;

  describe('Create Role', () => {
    it('should create a new role', (done) => {
      db.Role.create(testData.newRole2)
        .then((role) => {
          newRole = role;
          should(role.title).equal(testData.newRole2.title);
          should(role).have.property('createdAt');
          done();
        });
    });

    it('should fail when role title already exist', (done) => {
      db.Role.create(testData.newRole2)
        .then()
        .catch((error) => {
          should(error.errors[0].message).equal('title must be unique');
          done();
        });
    });
  });

  describe('Not null violation', () => {
    it('should fail when title of a role is null', (done) => {
      const nullTitle = { title: null };
      db.Role.create(nullTitle)
        .then()
        .catch((error) => {
          should(error.errors[0].message).equal('title cannot be null');
          done();
        });
    });
  });

  describe('EMPTY String violation', () => {
    it('should fail for empty string title', (done) => {
      const emptyTitle = { title: ' ' };
      db.Role.create(emptyTitle)
        .then()
        .catch((error) => {
          error.errors[0].message.should.equal('title cannot be empty.');
          done();
        });
    });
  });

  describe('DELETE role', () => {
    it('should delete a role', (done) => {
      db.Role.destroy({ where: { id: newRole.id } })
        .then(() => {
          db.Role.findById(newRole.id)
            .then((response) => {
              should(response).equal(null);
              done();
            });
        });
    });
  });
});
