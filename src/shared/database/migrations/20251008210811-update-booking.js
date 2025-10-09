"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("bookings", "rating");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("bookings", "rating", {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    });
  },
};
