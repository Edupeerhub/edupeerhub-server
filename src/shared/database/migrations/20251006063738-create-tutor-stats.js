"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tutor_stats", {
      tutor_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "tutor_profiles",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      total_completed_sessions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_weekly_sessions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_students: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_hours_taught: {
        type: Sequelize.DECIMAL(6, 1),
        allowNull: false,
        defaultValue: 0.0,
      },
      average_rating: {
        type: Sequelize.DECIMAL(2, 1),
        allowNull: false,
        defaultValue: 0.0,
      },
      total_reviews: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      review_breakdown: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [
          { stars: 5, percent: 0 },
          { stars: 4, percent: 0 },
          { stars: 3, percent: 0 },
          { stars: 2, percent: 0 },
          { stars: 1, percent: 0 },
        ],
      },
      last_updated: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tutor_stats");
  },
};
