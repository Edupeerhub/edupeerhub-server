"use strict";
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash("Password123!", 10);

    // Helper to insert user if not exists
    const ensureUser = async (email, role, extraFields = {}) => {
      const [rows] = await queryInterface.sequelize.query(
        `SELECT id FROM users WHERE email = :email`,
        { replacements: { email } }
      );

      let userId;
      if (rows.length === 0) {
        userId = uuidv4();
        await queryInterface.bulkInsert("users", [
          {
            id: userId,
            email,
            first_name: extraFields.first_name || "Default",
            last_name: extraFields.last_name || role,
            password_hash: passwordHash,
            role,
            is_verified: true,
            is_onboarded: true,
            account_status: "active",
            deleted_at: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ]);
      } else {
        userId = rows[0].id;
      }

      return userId;
    };

    // Admin
    const adminId = await ensureUser("admin@example.com", "admin", {
      first_name: "Default",
      last_name: "Admin",
    });
    await queryInterface.bulkInsert(
      "admin_profiles",
      [
        {
          user_id: adminId,
          is_super_admin: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { ignoreDuplicates: true }
    );

    // Tutor
    const tutorId = await ensureUser("tutor@example.com", "tutor", {
      first_name: "John",
      last_name: "Tutor",
    });
    await queryInterface.bulkInsert(
      "tutor_profiles",
      [
        {
          user_id: tutorId,
          bio: "Experienced math tutor",
          rating: 5.0,
          approval_status: "approved",
          profile_visibility: "active",
          education: "MSc Mathematics",
          timezone: "UTC",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { ignoreDuplicates: true }
    );

    // Student
    const studentId = await ensureUser("student@example.com", "student", {
      first_name: "Jane",
      last_name: "Student",
    });
    await queryInterface.bulkInsert(
      "student_profiles",
      [
        {
          user_id: studentId,
          grade_level: "10",
          learning_goals: ["Improve math", "Improve science"],
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { ignoreDuplicates: true }
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("admin_profiles", null, {});
    await queryInterface.bulkDelete("tutor_profiles", null, {});
    await queryInterface.bulkDelete("student_profiles", null, {});
    await queryInterface.bulkDelete("users", {
      email: ["admin@example.com", "tutor@example.com", "student@example.com"],
    });
  },
};
