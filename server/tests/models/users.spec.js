import should from 'should';
import db from '../../models';
import userData from '../helpers/specHelper';

const requiredFields = ['username', 'firstName', 'lastName', 'email', 'roleId'];
let regularUser;

describe('User model', () => {
  after((done) => {
    db.User.destroy({ where: {} });
    done();
  });

  describe('Create user', () => {
    it('creates a new user', (done) => {
      db.User.create(userData.firstUser)
      .then((user) => {
        regularUser = user;
        user.firstName.should.equal(userData.firstUser.firstName);
        user.lastName.should.equal(userData.firstUser.lastName);
        user.username.should.equal(userData.firstUser.username);
        user.email.should.equal(userData.firstUser.email);
        user.should.have.property('password');
        done();
      });
    });

    it('should ensure user password is hashed', (done) => {
      regularUser.password.should.not.equal(userData.firstUser.password);
      done();
    });

    it('should ensure username is more than two characters', (done) => {
      regularUser.firstName.length.should.be.above(2);
      done();
    });

    it('should ensure first name is more than a character', (done) => {
      regularUser.firstName.length.should.be.above(1);
      done();
    });

    it('should ensure last name is more than a character', (done) => {
      regularUser.lastName.length.should.be.above(1);
      done();
    });

    it('should fail when email is invalid', (done) => {
      db.User.create(userData.invalidEmail)
        .then()
        .catch((error) => {
          error.errors[0].message.should.equal('Email address is invalid');
          done();
        });
    });

    it('should fail when password characters is not up to 6', (done) => {
      db.User.create(userData.badPassword)
        .then()
        .catch((error) => {
          error.errors[0].message.should
            .equal('Password must be at least 6 characters.');
          done();
        });
    });

    it('should ensure a default roleId of 2 is being saved', (done) => {
      regularUser.roleId.should.equal(2);
      done();
    });

    it('should ensure a roleId of 1 is saved for an admin', (done) => {
      db.User.create(userData.admin)
        .then((user) => {
          user.roleId.should.equal(1);
          done();
        });
    });
  });

  describe('Unique', () => {
    it('should not allow duplicate username', (done) => {
      db.User.create(userData.firstUser)
      .then((newUser) => {
        should.not.exist(newUser);
      })
      .catch((error) => {
        error.errors[0].message.should.equal('Sorry, username already exists.');
        done();
      });
    });

    it('should not allow duplicate email address', (done) => {
      userData.firstUser.username = 'iAmUniqueUsername';
      db.User.create(userData.firstUser)
      .then((newUser) => {
        should.not.exist(newUser);
      })
      .catch((error) => {
        error.errors[0].message.should.equal('Sorry, email already exists.');
        done();
      });
    });
  });

  describe('Not null validation', () => {
    requiredFields.forEach((field) => {
      it(`should fail when ${field} is null`, (done) => {
        const nullField = Object.assign({}, userData.firstUser);
        nullField[field] = null;
        db.User.create(nullField)
          .then()
          .catch((error) => {
            error.errors[0].message.should.equal(`${field} cannot be null`);
            done();
          });
      });
    });
  });

  describe('Update user', () => {
    const updatedUser = {};
    before((done) => {
      const updateUser = { firstName: 'Jorg', password: 'password' };
      db.User.findById(regularUser.id)
        .then((user) => {
          user.update(updateUser)
          .then((getUpdatedUser) => {
            Object.assign(updatedUser, getUpdatedUser.dataValues);
            done();
          });
        });
    });

    it('should ensure user attributes are updated', (done) => {
      db.User.findById(updatedUser.id)
        .then((user) => {
          should(user.id).equal(regularUser.id);
          should(user.firstName).not.equal(regularUser.firstName);
          done();
        });
    });

    it('should ensure user password is hashed', (done) => {
      db.User.findById(updatedUser.id)
        .then((user) => {
          should(user.password).not.equal(regularUser.password);
          done();
        });
    });
  });
});
