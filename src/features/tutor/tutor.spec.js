const request = require("supertest");
const { cleanupDB } = require("@src/shared/tests/test-db");

const sequelize = require("@src/shared/database/index");
const app = require("@src/app");
const { User, Tutor } = require("@models");

const session = require("supertest-session");
const { test } = require("@src/shared/config/db.config");

let authenticatedSession;
let testSession;

const user = {
  firstName: "John",
  lastName: "Dupe",
  email: "john@example.com",
  password: "StrongPass123!",
};

const hashedPassword =
  "$2b$10$PjBOJPU3o7wQtjVfpQnUIuhmn69ZYjXDNqlQjLy7eXkjIvQW.WeZ.";

beforeEach(async () => {
  await cleanupDB();
  testSession = session(app);
});

describe("POST /tutor/", () => {
  beforeEach(async () => {
    await testSession
      .post("/api/auth/signup")
      .send({
        firstName: "John",
        lastName: "Dupe",
        email: "john@example.com",
        password: "StrongPass123!",
      })
      .expect(201);
    // .end((err) => {
    //   if (err) return done(err);
    //   return done();
    // });
    authenticatedSession = testSession;
    console.log("done");

    // await authenticatedSession.post("api/tutor/").send({
    //   bio: "I am a tutor",
    //   education: "BSc Early Child Education",
    //   timezone: "UTC",
    //   subjects: [],
    // });
  });

  it("should create tutor and return tutor details", async () => {
    const tutor = {
      bio: "I am a tutor",
      education: "BSc Early Child Education",
      timezone: "UTC",
      subjects: [],
    };

    const response = await authenticatedSession.post(`/api/tutor/`).send(tutor);

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: "created successfully",
      data: {
        profileVisibility: "hidden",
        bio: tutor.bio,
        education: tutor.education,
        timezone: tutor.timezone,
        rating: 0,
        subjects: expect.arrayContaining(tutor.subjects),
        approvalStatus: "pending",
        userId: expect.any(String),
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
        rejectionReason: null,
      },
    });
  });
});

describe("GET /tutor", () => {
  it("should return tutor details when tutor exists in db", async () => {
    await testSession
      .post("/api/auth/signup")
      .send({
        firstName: "John",
        lastName: "Dupe",
        email: "john@example.com",
        password: "StrongPass123!",
      })
      .expect(201);

    authenticatedSession = testSession;

    const tutor = {
      bio: "I am a tutor",
      education: "BSc Early Child Education",
      timezone: "UTC",
      subjects: [],
    };

    const tutorId = 1;
    const response = await authenticatedSession.get(`/api/tutor/`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Tutors retrieved successfully",
      data: {
        profileVisibility: "hidden",
        bio: tutor.bio,
        education: tutor.education,
        timezone: tutor.timezone,
        rating: 0,

        subjects: expect.arrayContaining(tutor.subjects),
        approvalStatus: "pending",
        userId: expect.any(String),
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
        rejectionReason: null,
      },
    });
  });
});
