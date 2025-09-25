"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reviews", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      reviewer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      reviewee_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      session_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "bookings",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM(
          "tutor_to_student",
          "student_to_tutor",
          "session_feedback"
        ),
        allowNull: false,
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
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Indexes
    await queryInterface.addIndex("reviews", ["reviewer_id"]);
    await queryInterface.addIndex("reviews", ["reviewee_id"]);
    await queryInterface.addIndex("reviews", ["session_id"]);
    await queryInterface.addIndex("reviews", ["type"]);
    await queryInterface.addIndex("reviews", ["created_at"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("reviews");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_reviews_type";'
    );
  },
};
