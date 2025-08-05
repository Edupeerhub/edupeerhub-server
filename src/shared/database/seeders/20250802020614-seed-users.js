"use strict";
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash("Password123!", 10);

    const adminId = uuidv4();
    const tutorId = uuidv4();
    const studentId = uuidv4();

    await queryInterface.bulkInsert("users", [
      {
        id: adminId,
        email: "admin@example.com",
        first_name: "Default",
        last_name: "Admin",
        password_hash: passwordHash,
        role: "admin",
        is_verified: true,
        is_onboarded: true,
        account_status: "active",
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: tutorId,
        email: "tutor@example.com",
        first_name: "John",
        last_name: "Tutor",
        password_hash: passwordHash,
        role: "tutor",
        is_verified: true,
        is_onboarded: true,
        account_status: "active",
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: studentId,
        email: "student@example.com",
        first_name: "Jane",
        last_name: "Student",
        password_hash: passwordHash,
        role: "student",
        is_verified: true,
        is_onboarded: true,
        account_status: "active",
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("admin_profiles", [
      {
        user_id: adminId,
        is_super_admin: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("tutor_profiles", [
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
    ]);

    await queryInterface.bulkInsert("student_profiles", [
      {
        user_id: studentId,
        grade_level: "10",
        learning_goals: "Improve math and science skills",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("admin_profiles", null, {});
    await queryInterface.bulkDelete("tutor_profiles", null, {});
    await queryInterface.bulkDelete("student_profiles", null, {});
    await queryInterface.bulkDelete("users", null, {});
  },
};
