"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tutor_profiles", {
      user_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      approval_status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      profile_visibility: {
        type: Sequelize.ENUM("active", "hidden"),
        allowNull: false,
        defaultValue: "hidden",
      },
      education: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      timezone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tutor_profiles");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_tutor_profiles_approval_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_tutor_profiles_profile_visibility";'
    );
  },
};
