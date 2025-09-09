"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      "subjects",
      [
        {
          name: "Maths",
          description: "Mathematics subject",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "English",
          description: "English subject",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Chemistry",
          description: "Chemistry subject",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Physics",
          description: "Physics subject",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { ignoreDuplicates: true }
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("subjects", {
      name: ["Maths", "English", "Chemistry", "Physics"],
    });
  },
};
