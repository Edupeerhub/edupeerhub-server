"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("bookings", "reminders", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {
        reminderSlot1: false,
        reminderSlot2: false,
        reminderSlot3: false,
      },
    });

    // Remove old non-unique indexes
    await queryInterface.removeIndex("bookings", "tutor_time_conflict_check");
    await queryInterface.removeIndex("bookings", "student_time_conflict_check");

    // Add new unique indexes
    await queryInterface.addIndex(
      "bookings",
      ["tutor_id", "scheduled_start", "scheduled_end"],
      {
        unique: true,
        name: "tutor_time_conflict_check",
      }
    );

    await queryInterface.addIndex(
      "bookings",
      ["student_id", "scheduled_start", "scheduled_end"],
      {
        unique: true,
        name: "student_time_conflict_check",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    // Revert back to non-unique indexes
    await queryInterface.removeIndex("bookings", "tutor_time_conflict_check");
    await queryInterface.removeIndex("bookings", "student_time_conflict_check");

    await queryInterface.addIndex(
      "bookings",
      ["tutor_id", "scheduled_start", "scheduled_end"],
      {
        name: "tutor_time_conflict_check",
      }
    );

    await queryInterface.addIndex(
      "bookings",
      ["student_id", "scheduled_start", "scheduled_end"],
      {
        name: "student_time_conflict_check",
      }
    );
  },
};
