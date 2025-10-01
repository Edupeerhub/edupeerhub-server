'use strict';
const { v4: uuid4 } = require("uuid");

module.exports = {
  async up (queryInterface) {

    await queryInterface.bulkInsert("subjects", [
      {
        id: 0,
        name: "Mathematics",
        description: "A basic Math text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 1,
        name: "English",
        description: "A basic English text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: "Chemistry",
        description: "A basic Chemistry text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: "Physics",
        description: "A basic Physics text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        name: "Literature",
        description: "A basic Literature text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        name: "Accounting",
        description: "A basic Accounting text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 6,
        name: "Computer Studies",
        description: "A basic Computer Studies text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 7,
        name: "Economics",
        description: "A basic Economics text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 8,
        name: "Government",
        description: "A basic Government text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 9,
        name: "French",
        description: "A basic French text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 10,
        name: "Music",
        description: "A basic Music text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 11,
        name: "Commerce",
        description: "A basic Commerce text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 12,
        name: "History",
        description: "A basic History text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 13,
        name: "Biology",
        description: "A basic Biology text block with no real info",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 14,
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
