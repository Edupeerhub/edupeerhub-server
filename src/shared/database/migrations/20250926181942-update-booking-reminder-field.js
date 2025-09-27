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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Bookings", "reminders", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: { "24h": false, "1h": false, "15m": false },
    });
  },
};
