"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
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
        type: Sequelize.STRING(500),
      },
      role: {
        type: Sequelize.ENUM("admin", "tutor", "student"),
        allowNull: false,
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      verification_token: {
        type: Sequelize.TEXT,
      },
      verification_token_expires_at: {
        type: Sequelize.DATE,
      },
      reset_password_token: {
        type: Sequelize.TEXT,
      },
      reset_password_expires_at: {
        type: Sequelize.DATE,
      },
      last_login: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex("users", ["email"], {
      name: "users_email_idx",
      unique: true,
    });

    await queryInterface.addIndex("users", ["role"], {
      name: "users_role_idx",
    });

    await queryInterface.addIndex("users", ["created_at"], {
      name: "users_created_at_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("users", "users_email_idx");
    await queryInterface.removeIndex("users", "users_role_idx");
    await queryInterface.removeIndex("users", "users_created_at_idx");

    await queryInterface.dropTable("users");
  },
};
