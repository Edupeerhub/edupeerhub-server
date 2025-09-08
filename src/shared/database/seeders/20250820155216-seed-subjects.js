'use strict';
const { v4: uuid4 } = require("uuid");

module.exports = {
  async up (queryInterface) {

    await queryInterface.bulkInsert("subjects", [
      {
        id: uuid4(),
        name: "Mathematics",
        description: "A basic Math text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuid4(),
        name: "English",
        description: "A basic English text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuid4(),
        name: "Chemistry",
        description: "A basic Chemistry text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuid4(),
        name: "Physics",
        description: "A basic Physics text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuid4(),
        name: "Literature",
        description: "A basic Literature text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuid4(),
        name: "Accounting",
        description: "A basic Accounting text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuid4(),
        name: "Computer Studies",
        description: "A basic Computer Studies text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuid4(),
        name: "Economics",
        description: "A basic Economics text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuid4(),
        name: "Government",
        description: "A basic Government text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuid4(),
        name: "French",
        description: "A basic French text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuid4(),
        name: "Music",
        description: "A basic Music text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuid4(),
        name: "Commerce",
        description: "A basic Commerce text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuid4(),
        name: "History",
        description: "A basic History text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuid4(),
        name: "Biology",
        description: "A basic Biology text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuid4(),
        name: "Further Mathematics",
        description: "A basic Further Mathematics text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])

  },


  async down (queryInterface) {
    await queryInterface.bulkDelete("subjects", null, {});
  }
};
