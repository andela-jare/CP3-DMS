// import should from 'should';
// import db from '../../models';
// import testData from '../helpers/specHelper';


// const userParams = testData.firstUser;

// const requiredFields = ['username', 'firstName', 'lastName', 'email', 'roleId'];
// let regularUser;

// describe('User model', () => {
//   after((done) => { db.User.destroy({ where: {} }); done(); });

//   describe('Create user', () => {
//     it('creates a new user', (done) => {
//       db.User.create(userParams)
//       .then((user) => {
//         regularUser = user.dataValues;
//         user.firstName.should.equal(userParams.firstName);
//         user.lastName.should.equal(userParams.lastName);
//         user.username.should.equal(userParams.username);
//         user.email.should.equal(userParams.email);
//         user.should.have.property('password');
//         done();
//       });
//     });

//     it('should fail when email is invalid', (done) => {
//       db.User.create(testData.badUser)
//         .then()
//         .catch((error) => {
//           error.errors[0].message.should.equal('Invalid email');
//           error.errors[0].type.should.equal('Validation error');
//           error.errors[0].path.should.equal('email');
//           done();
//         });
//     });

//     it('should fails when password character is not up to 6', (done) => {
//       db.User.create(testData.badUser2)
//         .then()
//         .catch((error) => {
//           error.errors[0].message.should
//           .equal('Password must be at least 6 characters.');
//           error.errors[0].type.should.equal('Validation error');
//           done();
//         });
//     });
//   });

//   describe('Unique', () => {
//     it('should not allow duplicates users', (done) => {
//       db.User.create(userParams)
//       .then((newUser) => {
//         should.not.exist(newUser);
//       })
//       .catch((error) => {
//         error.errors[0].message.should.equal('Sorry, username already exists.');
//         done();
//       });
//     });

//     it('should not allow duplicates users', (done) => {
//       userParams.username = 'iAmUniqueUsername';
//       db.User.create(userParams)
//       .then((newUser) => {
//         should.not.exist(newUser);
//       })
//       .catch((error) => {
//         error.errors[0].message.should.equal('Sorry, email already exists.');
//         done();
//       });
//     });
//   });

//   describe('NOT NULL VIOLATIONS', () => {
//     requiredFields.forEach((field) => {
//       it(`should fail when ${field} is null`, (done) => {
//         const nullField = Object.assign({}, testData.firstUser);
//         nullField[field] = null;
//         db.User.create(nullField)
//           .then()
//           .catch((error) => {
//             error.errors[0].message.should.equal(`${field} cannot be null`);
//             error.errors[0].type.should.equal('notNull Violation');
//             error.errors[0].path.should.equal(field);
//             done();
//           });
//       });
//     });
//   });

//   describe('Update user', () => {
//     const updatedUser = {};
//     before((done) => {
//       const updateUser = { firstName: 'Jorg', password: 'password' };
//       db.User.findById(regularUser.id)
//         .then((user) => {
//           user.update(updateUser)
//           .then((getUpdatedUser) => {
//             Object.assign(updatedUser, getUpdatedUser.dataValues);
//             done();
//           });
//         });
//     });

//     it('should ensure user attributes are updated', (done) => {
//       db.User.findById(updatedUser.id)
//         .then((user) => {
//           should(user.id).equal(regularUser.id);
//           should(user.firstName).not.equal(regularUser.firstName);
//           done();
//         });
//     });

//     it('should ensure user password is hashed', (done) => {
//       db.User.findById(updatedUser.id)
//         .then((user) => {
//           should(user.password).not.equal(regularUser.password);
//           done();
//         });
//     });
//   });
// });
