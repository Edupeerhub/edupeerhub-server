const request = require("supertest");
const {cleanupDB} = require("@src/shared/tests/test-db");

const sequelize = require("@src/shared/database/index");
const app = require("@src/app");
const { User, Tutor } = require("@models");

describe("GET /tutor/:id", () => {
  beforeEach(async () => await cleanupDB());

  it("should return tutor details when tutor exists in db", async () => {
    const user = {
      email: "testemail@email.com",
      firstName: "firstName",
      lastName: "lastName",
      passwordHash: "hashedPassword",
      profileImageUrl: "randomAvatar",
      verificationToken: "123456",
      verificationTokenExpiresAt: Date.now(),
      isVerified: false,
      isOnboarded: false,
    };

    const userData =await sequelize.getQueryInterface().bulkInsert("Users", [
      user,
    ]);

    const tutor = {
      userId: user.Id,
      bio: "I am a tutor",
      rating: 5.0,
      approvalStatus: "approved",
      profileVisibility: "active",
      education: "BSc Early Child Education",
      timezone: "UTC",
      subjects: "english, maths, biology",
    };

     
    const tutorId = 1;
    const response = await request(app).get(`/api/tutor/${tutorId}`);

    expect(response.statusCode).toBe(200);
  });
});
