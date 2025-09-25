"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("bookings", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },
      tutor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "tutors",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "students",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "subjects",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      scheduled_start: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      scheduled_end: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          "open",
          "pending",
          "confirmed",
          "completed",
          "cancelled"
        ),
        allowNull: false,
        defaultValue: "open",
      },
      meeting_link: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      tutor_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      student_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cancelled_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      cancellation_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_recurring: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      recurring_pattern: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      reminders: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: { "24h": false, "1h": false, "15m": false },
      },
      actual_start_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      actual_end_time: {
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

    // Indexes
    await queryInterface.addIndex("bookings", ["tutor_id"]);
    await queryInterface.addIndex("bookings", ["student_id"]);
    await queryInterface.addIndex("bookings", ["subject_id"]);
    await queryInterface.addIndex("bookings", ["status"]);
    await queryInterface.addIndex("bookings", ["scheduled_start"]);
    await queryInterface.addIndex("bookings", ["scheduled_end"]);
    await queryInterface.addIndex(
      "bookings",
      ["tutor_id", "scheduled_start", "scheduled_end"],
      { name: "tutor_time_conflict_check" }
    );
    await queryInterface.addIndex(
      "bookings",
      ["student_id", "scheduled_start", "scheduled_end"],
      { name: "student_time_conflict_check" }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("bookings");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_bookings_status";'
    );
  },
};
