'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('student_subjects', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'student_profiles',
          key: 'user_id'
        }
      },
      subject_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'subjects',
          key: 'id'
        }
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

    // Add indexes (matching the pattern in your User model)
    await queryInterface.addIndex('student_subjects', ['student_id']);
    await queryInterface.addIndex('student_subjects', ['subject_id']);
    await queryInterface.addIndex('student_subjects', ['deleted_at']);
  },

  async down (queryInterface) {
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['subject_id']);
    await queryInterface.removeIndex('student_exams', ['deleted_at']);

    // Drop table    
    await queryInterface.dropTable('student_subjects');
  }
};
