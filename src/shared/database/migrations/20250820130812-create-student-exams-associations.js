'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('student_exams', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      student_id: {
        type: Sequelize.UUID,
        references: {
          model: 'student_profiles',
          key: 'user_id'
        },
        allowNull: false
      },
      exam_id: {
        type: Sequelize.UUID,
        references: {
          model: 'exams',
          key: 'id'
        },
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // Add proper indexes (matches User model pattern)
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['exam_id']);
    await queryInterface.addIndex('student_exams', ['deleted_at']);
  },

  async down (queryInterface) {
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['exam_id']);
    await queryInterface.removeIndex('student_exams', ['deleted_at']);

    await queryInterface.dropTable('student_exams');
  }
};
