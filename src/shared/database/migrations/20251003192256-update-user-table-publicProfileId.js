"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "profile_image_public_id", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Cloudinary public_id for tutor profile picture",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "profile_image_public_id");
  },
};
