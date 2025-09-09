"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "is_deleted");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "is_deleted", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },
};
