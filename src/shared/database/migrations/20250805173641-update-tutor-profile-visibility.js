"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tutor_profiles", "profile_status");

    await queryInterface.addColumn("tutor_profiles", "profile_visibility", {
      type: Sequelize.ENUM("active", "hidden"),
      allowNull: false,
      defaultValue: "active",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tutor_profiles", "profile_visibility");

    await queryInterface.addColumn("tutor_profiles", "profile_status", {
      type: Sequelize.ENUM("active", "suspended", "hidden"),
      allowNull: false,
      defaultValue: "active",
    });

    if (queryInterface.sequelize.options.dialect === "postgres") {
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS enum_tutor_profiles_profile_visibility;`
      );
    }
  },
};
