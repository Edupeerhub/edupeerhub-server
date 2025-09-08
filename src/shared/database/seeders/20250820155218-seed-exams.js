"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("exams", [
      {
        name: "JAMB",
        description: "For university entrance",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "WAEC",
        description: "For Senior Secondary School Certificates",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "NABTEB",
        description: "For technical and business exams",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "BECE",
        description: "For Junior Secondary School completion",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("exams", null, {});
  },
};
