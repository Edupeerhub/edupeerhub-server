"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("admin_profiles", "admin_role");

    await queryInterface.addColumn("admin_profiles", "is_super_admin", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("admin_profiles", "is_super_admin");

    await queryInterface.addColumn("admin_profiles", "admin_role", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "super_admin",
    });
  },
};
