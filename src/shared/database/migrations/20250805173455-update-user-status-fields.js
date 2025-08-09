"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "email_verified");

    await queryInterface.addColumn("users", "is_verified", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("users", "is_onboarded", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("users", "account_status", {
      type: Sequelize.ENUM("active", "suspended"),
      allowNull: false,
      defaultValue: "active",
    });

    await queryInterface.addColumn("users", "suspended_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "suspension_reason", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "is_deleted", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("users", "deleted_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "is_verified");
    await queryInterface.removeColumn("users", "is_onboarded");
    await queryInterface.removeColumn("users", "account_status");
    await queryInterface.removeColumn("users", "suspended_at");
    await queryInterface.removeColumn("users", "suspension_reason");
    await queryInterface.removeColumn("users", "is_deleted");
    await queryInterface.removeColumn("users", "deleted_at");

    await queryInterface.addColumn("users", "email_verified", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    if (queryInterface.sequelize.options.dialect === "postgres") {
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS enum_users_account_status;`
      );
    }
  },
};
