'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      reviewer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      reviewee_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      session_id: {
        type: Sequelize.UUID,
        allowNull: true,  //nullable till session logic is ready
        // references: {
        //   model: 'sessions', // - uncomment when session table exists
        //   key: 'id',
        // },
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
        type: Sequelize.ENUM('tutor_to_student', 'student_to_tutor', 'session_feedback'),
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });
    // Indexes for efficient querying
    await queryInterface.addIndex('reviews', ['reviewer_id']);
    await queryInterface.addIndex('reviews', ['reviewee_id']);
    await queryInterface.addIndex('reviews', ['session_id']);
    await queryInterface.addIndex('reviews', ['type']);
    await queryInterface.addIndex('reviews', ['deleted_at']);
    // Composite index for more common queries like "reviews for a user of a specific type"
    await queryInterface.addIndex('reviews', ['reviewee_id', 'type']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Reviews');
  }
};