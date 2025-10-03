"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tutor_profiles", "document_key", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "S3 object key for uploaded document",
    });

    await queryInterface.changeColumn("tutor_profiles", "profile_visibility", {
      type: Sequelize.ENUM("active", "hidden"),
      allowNull: false,
      defaultValue: "active",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tutor_profiles", "document_key");

    await queryInterface.changeColumn("tutor_profiles", "profile_visibility", {
      type: Sequelize.ENUM("active", "hidden"),
      allowNull: false,
      defaultValue: "hidden",
    });
  },
};
