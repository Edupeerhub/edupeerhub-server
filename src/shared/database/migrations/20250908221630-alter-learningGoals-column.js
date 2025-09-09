"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "student_profiles"
      ALTER COLUMN "learning_goals"
      TYPE TEXT[]
      USING "learning_goals"::text[];
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("student_profiles", "learning_goals", {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
