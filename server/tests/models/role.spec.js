// import should from 'should';
// import db from '../../models';
// import testData from '../helpers/specHelper';

// describe('ROLE', () => {
//   let newRole;
//   describe('Create Role', () => {
//     it('should save role detail', (done) => {
//       db.Role.create(testData.newRole4)
//         .then((role) => {
//           newRole = role.dataValues;
//           should(role.dataValues.title).equal(testData.newRole4.title);
//           done();
//         });
//     });

//     it('should fail when role title already exist', (done) => {
//       db.Role.create(testData.newRole4)
//         .then()
//         .catch((error) => {
//           should(error.errors[0].message).equal('title must be unique');
//           should(error.errors[0].type).equal('unique violation');
//           should(error.errors[0].path).equal('title');
//           should(error.errors[0].value).equal('guest');
//           done();
//         });
//     });
//   });

//   describe('Not null violation', () => {
//     it('should fail when title of a role is null', (done) => {
//       const nullTitle = { title: null };
//       db.Role.create(nullTitle)
//         .then()
//         .catch((error) => {
//           should(error.errors[0].message).equal('title cannot be null');
//           should(error.errors[0].type).equal('notNull Violation');
//           should(error.errors[0].value).equal(null);
//           done();
//         });
//     });
//   });

//   describe('DELETE role', () => {
//     it('should delete a role', (done) => {
//       db.Role.destroy({ where: { id: newRole.id } })
//         .then(() => {
//           db.Role.findById(newRole.id)
//             .then((response) => {
//               should(response).equal(null);
//               done();
//             });
//         });
//     });
//   });
// });
