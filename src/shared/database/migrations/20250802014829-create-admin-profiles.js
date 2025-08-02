"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("admin_profiles", {
      user_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      admin_role: {
        type: Sequelize.ENUM("admin", "super_admin"),
        allowNull: false,
        defaultValue: "admin",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("admin_profiles", ["admin_role"], {
      name: "admin_profiles_admin_role_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "admin_profiles",
      "admin_profiles_admin_role_idx"
    );
    await queryInterface.dropTable("admin_profiles");
  },
};
