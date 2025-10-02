"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tutor_profiles", "documentKey", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "S3 object key for uploaded document",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tutor_profiles", "documentKey");
  },
};
