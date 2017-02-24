'use strict';

module.exports = {
  up: function up(queryInterface) {
    return queryInterface.bulkInsert('Roles', [{
      id: 1,
      title: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 2,
      title: 'regular',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },
  down: function down(queryInterface) {
    return queryInterface.bulkDelete('Roles', { title: ['admin', 'regular'] });
  }
};