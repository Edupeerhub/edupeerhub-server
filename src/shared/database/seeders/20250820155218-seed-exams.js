"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      "exams",
      [
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
          name: "NECO",
          description: "For Senior Secondary School Certificates",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "GCE",
          description: "For Senior Secondary School Certificates",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { ignoreDuplicates: true }
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("exams", null, {});
  },
};
