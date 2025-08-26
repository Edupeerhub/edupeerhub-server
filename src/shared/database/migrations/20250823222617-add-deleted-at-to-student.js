'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("student_profiles", "deleted_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    // Index for soft delete (matching User model pattern)
    await queryInterface.addIndex('student_profiles', ['deleted_at']);
  },

  async down (queryInterface) {
    await queryInterface.removeColumn("student_profiles", "deleted_at");
  }
};
