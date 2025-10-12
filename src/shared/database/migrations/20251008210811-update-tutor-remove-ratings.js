"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tutor_profiles", "rating");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("tutor_profiles", "rating", {
      rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
    });
  },
};
