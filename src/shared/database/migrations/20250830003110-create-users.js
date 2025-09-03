"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      profile_image_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      role: {
        type: Sequelize.ENUM("admin", "tutor", "student"),
        allowNull: true,
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_onboarded: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      account_status: {
        type: Sequelize.ENUM("active", "suspended"),
        allowNull: false,
        defaultValue: "active",
      },
      suspended_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      suspension_reason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      verification_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      verification_token_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      reset_password_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reset_password_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
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

    // Indexes
    await queryInterface.addIndex("users", ["email"]);
    await queryInterface.addIndex("users", ["role"]);
    await queryInterface.addIndex("users", ["account_status"]);
    await queryInterface.addIndex("users", ["is_verified"]);
    await queryInterface.addIndex("users", ["is_deleted"]);
    await queryInterface.addIndex("users", ["verification_token"]);
    await queryInterface.addIndex("users", ["reset_password_token"]);
    await queryInterface.addIndex("users", ["created_at"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_role";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_account_status";'
    );
  },
};
