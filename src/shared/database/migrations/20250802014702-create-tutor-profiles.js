"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tutor_profiles", {
      user_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      rating: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
        defaultValue: null,
      },
      approval_status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      profile_status: {
        type: Sequelize.ENUM("active", "suspended", "hidden"),
        allowNull: false,
        defaultValue: "active",
      },
      education: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      timezone: {
        type: Sequelize.STRING(50),
        allowNull: false,
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

    await queryInterface.addIndex("tutor_profiles", ["approval_status"], {
      name: "tutor_profiles_approval_status_idx",
    });

    await queryInterface.addIndex("tutor_profiles", ["profile_status"], {
      name: "tutor_profiles_profile_status_idx",
    });

    await queryInterface.addIndex("tutor_profiles", ["rating"], {
      name: "tutor_profiles_rating_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "tutor_profiles",
      "tutor_profiles_approval_status_idx"
    );
    await queryInterface.removeIndex(
      "tutor_profiles",
      "tutor_profiles_profile_status_idx"
    );
    await queryInterface.removeIndex(
      "tutor_profiles",
      "tutor_profiles_rating_idx"
    );
    await queryInterface.dropTable("tutor_profiles");
  },
};
