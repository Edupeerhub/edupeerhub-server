'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("exams", "deleted_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn("exams", "deleted_at");
  }
};
