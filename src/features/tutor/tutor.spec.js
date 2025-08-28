const request = require("supertest");
const { cleanupDB } = require("@src/shared/tests/test-db");

const sequelize = require("@src/shared/database/index");
const app = require("@src/app");
const { User, Tutor, Subject } = require("@models");

const session = require("supertest-session");
const { test } = require("@src/shared/config/db.config");
const {
  createVerifiedUser,
  userObject: user,
} = require("@src/shared/tests/utils");

let authenticatedSession;
let testSession;

async function createTestTutors(count = 5) {
  console.log("Creating test tutors");
  // Create users
  const users = await User.bulkCreate(
    Array.from({ length: count }).map((_, i) => ({
      email: `tutor${i}@test.com`,
      firstName: `Tutor${i}`,
      lastName: `Test${i}`,
      passwordHash: "password123", // Will be hashed by hook
      role: "tutor",
      isVerified: true,
    })),
    { returning: true }
  );

  const subjects = await Subject.bulkCreate(
    [
      {
        name: "English",
        description: "Basic English language",
        isActive: true,
      },
      {
        name: "Mathematics",
        description: "Basic Mathematics",
        isActive: true,
      },
      {
        name: "Biology",
        description: "Biology and natural sciences",
        isActive: true,
      },
      {
        name: "Chemistry",
        description: "Chemistry and chemical sciences",
        isActive: true,
      },
    ],
    { returning: true }
  );
  // Create tutors linked to users
  const tutors = await Tutor.bulkCreate(
    users.map((user, i) => ({
      userId: user.id,
      bio: `Bio for tutor ${i}`,
      rating: 0,
      education: `Education ${i}`,
      timezone: "UTC",
      approvalStatus: i % 2 === 0 ? "approved" : "pending",
      profileVisibility: i % 2 === 0 ? "active" : "hidden",
    })),
    { returning: true }
  );

  await tutors.map(async (tutor, i) => {
    const numSubjectsForTutor = i + 1;
    const startIndex = i * numSubjectsForTutor;
    const endIndex = startIndex + numSubjectsForTutor;
    const slice = subjects.slice(startIndex, endIndex);
    return await tutor.setSubjects(slice);
  });

  return tutors;
}
describe("Tutor test", () => {
  beforeEach(async () => {
    console.log("Top level before each");
    await cleanupDB();
    testSession = session(app);
    await createVerifiedUser();
    await testSession
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200);

    authenticatedSession = testSession;
  });

  describe("POST /tutor/", () => {
    it("should create tutor and return tutor details", async () => {
      const tutor = {
        bio: "I am a tutor",
        education: "BSc Early Child Education",
        timezone: "UTC",
        subjects: [],
      };

      const response = await authenticatedSession
        .post(`/api/tutor/`)
        .send(tutor);

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
    beforeEach(async () => {
      await createTestTutors();
    });
    it("should return all approved tutors", async () => {
      // await createTestTutors();

      const response = await authenticatedSession.get(`/api/tutor/`);
      const approvedTutors = 3;
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Tutors retrieved successfully",
        data: {
          count: expect.any(Number),
          rows: expect.arrayOf(
            expect.objectContaining({
              approvalStatus: expect.any(String),
              bio: expect.any(String),
              createdAt: expect.any(String),
              education: expect.any(String),
              profileVisibility: expect.any(String),
              rating: expect.any(Number),
              rejectionReason: null,
              // subjects: expect.any(Array),
              subjects: expect.arrayOf(
                expect.objectContaining({
                  id: expect.any(Number),
                  name: expect.any(String),
                  description: expect.any(String),
                  is_active: expect.any(Boolean),
                  updatedAt: expect.any(String),
                  createdAt: expect.any(String),
                })
              ),
              timezone: expect.any(String),
              updatedAt: expect.any(String),
              userId: expect.any(String),
            })
          ),
        },
      });

      console.log(response.body.data.rows);
    });

    it("should return tutor for subjects", async () => {
      const response = await authenticatedSession.get(
        `/api/tutor/?subjects=English,Mathematics`
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Tutors retrieved successfully",
        data: {
          count: 3,
          rows: expect.arrayOf(
            expect.objectContaining({
              approvalStatus: expect.any(String),
              bio: expect.any(String),
              createdAt: expect.any(String),
              education: expect.any(String),
              profileVisibility: expect.any(String),
              rating: expect.any(Number),
              rejectionReason: null,
              // subjects: expect.any(Array),
              subjects: expect.arrayOf(
                expect.objectContaining({
                  id: expect.any(Number),
                  name: expect.any(String),
                  description: expect.any(String),
                  isActive: expect.any(Boolean),
                  createdAt: expect.any(String),
                  updatedAt: expect.any(String),
                })
              ),
              timezone: expect.any(String),
              updatedAt: expect.any(String),
              userId: expect.any(String),
            })
          ),
        },
      });

      console.log(response.body.data.rows);
    });
  });
});
