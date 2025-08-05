"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("student_profiles", {
      user_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      grade_level: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      learning_goals: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex("student_profiles", ["grade_level"], {
      name: "student_profiles_grade_level_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "student_profiles",
      "student_profiles_grade_level_idx"
    );

    await queryInterface.dropTable("student_profiles");
  },
};
