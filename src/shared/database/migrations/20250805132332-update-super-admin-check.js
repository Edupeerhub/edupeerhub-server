"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("admin_profiles", "admin_role");

    await queryInterface.addColumn("admin_profiles", "is_super_admin", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("admin_profiles", "is_super_admin");

    await queryInterface.addColumn("admin_profiles", "admin_role", {
      type: Sequelize.ENUM("admin", "super_admin"),
      allowNull: false,
      defaultValue: "admin",
    });
  },
};
