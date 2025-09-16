"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("sessions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "student_profiles",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      tutor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "tutor_profiles",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "subjects",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        defaultValue: 60,
        allowNull: false,
        comment: "Duration in minutes",
      },
      status: {
        type: Sequelize.ENUM(
          "scheduled",
          "confirmed",
          "in_progress",
          "completed",
          "cancelled",
          "no_show"
        ),
        defaultValue: "scheduled",
        allowNull: false,
      },
      meeting_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      meeting_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cancellation_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reminders_sent: {
        type: Sequelize.JSONB,
        defaultValue: {
          "24_hours": false,
          "1_hour": false,
          "15_minutes": false,
        },
        allowNull: false,
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex("sessions", ["student_id"]);
    await queryInterface.addIndex("sessions", ["tutor_id"]);
    await queryInterface.addIndex("sessions", ["subject_id"]);
    await queryInterface.addIndex("sessions", ["scheduled_at"]);
    await queryInterface.addIndex("sessions", ["status"]);
    await queryInterface.addIndex("sessions", ["created_at"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("sessions");
  },
};