'use strict';
const { v4: uuid4 } = require("uuid");

module.exports = {
  async up (queryInterface) {

    await queryInterface.bulkInsert("exams", [
      {
        id: 0,
        name: "JAMB",
        description: "For university entrance",
        isActive: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 1,
        name: "WAEC",
        description: "For Senior Secondary School Certificates",
        isActive: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: "NABTEB",
        description: "For technical and business exams",
        isActive: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: "BECE",
        description: "For Junior Secondary School completion",
        isActive: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])

  },


  async down (queryInterface) {
    await queryInterface.bulkDelete("exams", null, {});
  }
};
