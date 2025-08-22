'use strict';
const { v4: uuid4 } = require("uuid");

module.exports = {
  async up (queryInterface) {

    const subjectId = uuid4()

    await queryInterface.bulkInsert("subjects", [
      {
        id: subjectId,
        name: "Mathematics",
        description: "A basic Math text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
      {
        id: subjectId,
        name: "English",
        description: "A basic English text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
      {
        id: subjectId,
        name: "Chemistry",
        description: "A basic Chemistry text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
      {
        id: subjectId,
        name: "Physics",
        description: "A basic text Physics block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
      {
        id: subjectId,
        name: "Literature",
        description: "A basic Literature text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
      {
        id: subjectId,
        name: "Accounting",
        description: "A basic Accounting text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
      {
        id: subjectId,
        name: "Computer Studies",
        description: "A basic Computer Studies text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
      {
        id: subjectId,
        name: "Economics",
        description: "A basic Ecconomics text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
      {
        id: subjectId,
        name: "Government",
        description: "A basic Government text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
      {
        id: subjectId,
        name: "French",
        description: "A basic French text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
      {
        id: subjectId,
        name: "Music",
        description: "A basic Music text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
      {
        id: subjectId,
        name: "Commerce",
        description: "A basic Commerce text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
      {
        id: subjectId,
        name: "History",
        description: "A basic History text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
      {
        id: subjectId,
        name: "Biology",
        description: "A basic Biology text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
      {
        id: subjectId,
        name: "Further Mathematics",
        description: "A basic Further Mathematics text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      },
    ])

  },


  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("subjects", null, {});
  }
};
