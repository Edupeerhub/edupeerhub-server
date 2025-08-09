"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex("users", ["account_status"], {
      name: "users_account_status_idx",
    });

    await queryInterface.addIndex("users", ["is_verified"], {
      name: "users_is_verified_idx",
    });

    await queryInterface.addIndex("users", ["is_deleted"], {
      name: "users_is_deleted_idx",
    });

    await queryInterface.addIndex("users", ["verification_token"], {
      name: "users_verification_token_idx",
    });

    await queryInterface.addIndex("users", ["reset_password_token"], {
      name: "users_reset_password_token_idx",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("users", "users_account_status_idx");
    await queryInterface.removeIndex("users", "users_is_verified_idx");
    await queryInterface.removeIndex("users", "users_is_deleted_idx");
    await queryInterface.removeIndex("users", "users_verification_token_idx");
    await queryInterface.removeIndex("users", "users_reset_password_token_idx");
  },
};
