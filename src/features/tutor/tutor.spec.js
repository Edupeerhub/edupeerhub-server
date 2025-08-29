const request = require("supertest");
const { cleanupDB } = require("@src/shared/tests/test-db");

const sequelize = require("@src/shared/database/index");
const app = require("@src/app");
const { User, Tutor, Subject, Student } = require("@models");

const session = require("supertest-session");
const { test } = require("@src/shared/config/db.config");
const {
  createVerifiedUser,
  userObject: user,
  uuid,
} = require("@src/shared/tests/utils");
const { error } = require("winston");

let authenticatedSession;
let testSession;
let loggedInUser;
let subjects;

jest.mock("@src/shared/middlewares/rateLimit.middleware", () => {
  return () => (req, res, next) => next();
});
async function createTestSubjects() {
  return await Subject.bulkCreate(
    [
      {
        name: "English",
        description: "Basic English language",
        is_active: true,
      },
      {
        name: "Mathematics",
        description: "Basic Mathematics",
        is_active: true,
      },
      {
        name: "Biology",
        description: "Biology and natural sciences",
        is_active: true,
      },
      {
        name: "Chemistry",
        description: "Chemistry and chemical sciences",
        is_active: true,
      },
    ],
    { returning: true }
  );
}
async function createTestStudents(count = 5) {
  console.log("Creating test students");
  // Create users
  const users = await User.bulkCreate(
    Array.from({ length: count }).map((_, i) => ({
      email: `student${i}@test.com`,
      firstName: `Student${i}`,
      lastName: `Test${i}`,
      passwordHash: "password123", // Will be hashed by hook
      role: "student",
      isVerified: true,
    })),
    { returning: true }
  );
  // Create tutors linked to users
  const students = await Student.bulkCreate(
    users.map((user, i) => ({
      userId: user.id,
      gradeLevel: `Grade ${i + 1}`,
      learningGoals: `Learning goals for student ${i}`,
    })),
    { returning: true }
  );

  await students.map(async (student, i) => {
    const numSubjectsForTutor = i + 1;
    const startIndex = i * numSubjectsForTutor;
    const endIndex = startIndex + numSubjectsForTutor;
    const slice = subjects.slice(startIndex, endIndex);
    return await student.setSubjects(slice);
  });

  return students;
}
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

const tutor = {
  bio: "I am a tutor",
  education: "BSc Early Child Education",
  timezone: "UTC",
  subjects: [],
};
const updatedProfile = {
  bio: "I am the best tutor",
  rating: 5.0,
  approvalStatus: "approved",
  profileVisibility: "active",
  education: "BSc Early Child Education",
  timezone: "UTC",
  subjects: [],
};
describe("Tutor test", () => {
  beforeEach(async () => {
    console.log("Top level before each");
    await cleanupDB();
    subjects = await createTestSubjects();

    testSession = session(app);
    loggedInUser = await createVerifiedUser();
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

    it("should return 404 for non-existent tutor", async () => {
      const response = await authenticatedSession.get(
        `/api/tutor/44e54e24-7e94-476c-b6e7-0bf0e2b1567e`
      );
      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
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
          count: expect.any(Number),
          rows: expect.any(Array),
        },
      });

      // Optionally, check if rows is empty or contains expected objects
      if (response.body.data.rows.length > 0) {
        response.body.data.rows.forEach((row) => {
          if (row.subjects.length > 0) {
            expect(row).toEqual(
              expect.objectContaining({
                approvalStatus: expect.any(String),
                bio: expect.any(String),
                createdAt: expect.any(String),
                education: expect.any(String),
                profileVisibility: expect.any(String),
                rating: expect.any(Number),
                rejectionReason: null,
                subjects: expect.any(Array),
                timezone: expect.any(String),
                updatedAt: expect.any(String),
                userId: expect.any(String),
              })
            );
          } else {
            expect(row.subjects).toEqual([]);
          }
        });
      }

      console.log(response.body.data.rows);
    });
  });

  describe("GET /tutor/:id", () => {
    it("should return a tutor profile by id", async () => {
      const tutors = await createTestTutors(1);
      const tutor = tutors[0];
      const response = await authenticatedSession.get(
        `/api/tutor/${tutor.userId}`
      );
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "success",
        // data: expect.any(Object)
        data: expect.objectContaining({
          userId: tutor.userId,
          bio: tutor.bio,
          rating: tutor.rating,
          approvalStatus: tutor.approvalStatus,
          rejectionReason: tutor.rejectionReason,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          timezone: tutor.timezone,

          profileVisibility: "active",
          education: tutor.education,
          subjects: expect.any(Array),
        }),
      });
    });

    it("should return 404 if tutor does not exist", async () => {
      const tutors = await createTestTutors(5);
      const tutor = tutors[0];

      const tutorId = uuid();

      const response = await authenticatedSession.get(`/api/tutor/${tutorId}`);
      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: "Tutor not found",
        // data: expect.any(Object)
        error: null,
      });
    });
  });

  describe("PUT /tutor/:id", () => {
    it("should update tutor profile if user is owner", async () => {
      // Simulate user id match

      const postRes = await authenticatedSession
        .post(`/api/tutor/`)
        .send(tutor);
      expect(postRes.statusCode).toEqual(201);

      const response = await authenticatedSession
        .put(`/api/tutor/${loggedInUser.id}`)
        .send(updatedProfile);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "success",
        data: expect.objectContaining({
          approvalStatus: updatedProfile.approvalStatus,
          bio: updatedProfile.bio,
          createdAt: expect.any(String),
          education: updatedProfile.education,
          profileVisibility: updatedProfile.profileVisibility,
          rating: updatedProfile.rating,
          rejectionReason: null,
          subjects: [],
          timezone: updatedProfile.timezone,
          updatedAt: expect.any(String),
          userId: loggedInUser.id,
        }),
      });
    });
    it("should return 400 if tutor profile not complete", async () => {
      const tutors = await createTestTutors(1);
      const tutor = tutors[0];

      const response = await authenticatedSession
        .put(`/api/tutor/${tutor.userId}`)
        .send({ bio: "Should not update" });
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          message: "Validation error.",
          error: expect.any(Array),
        })
      );
    });
    it("should return 403 if user is not owner", async () => {
      const tutors = await createTestTutors(1);
      const tutor = tutors[0];

      const response = await authenticatedSession
        .put(`/api/tutor/${tutor.userId}`)
        .send(updatedProfile);
      expect(response.statusCode).toBe(403);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          message: "Unauthorized",
          error: null,
        })
      );
    });
  });

  describe("GET /tutor/recommendations", () => {
    it("should return tutor recommendations ", async () => {
      await createTestTutors();
      const student = await Student.create({
        userId: loggedInUser.id,
        gradeLevel: `Grade ${1}`,
        learningGoals: `Learning goals for student ${1}`,
      });
      await student.addSubjects(subjects);
      const response = await authenticatedSession.get(
        `/api/tutor/recommendations/`
      );
      expect(response.statusCode).toBe(200);
      // expect(response.body.data.rows.length).toBe(3)
      expect(response.body).toEqual({
        success: true,
        message: "success",
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
    });
  });
});

// describe("GET /tutor/:id/schedule", () => {
//   it("should return tutor schedule (mocked)", async () => {
//     const response = await authenticatedSession.get(`/api/tutor/1/schedule`);
//     // Adjust expectations based on actual implementation
//     expect([200, 501]).toContain(response.statusCode);
//   });
// });

// describe("POST /tutor/availability", () => {
//   it("should set weekly availability (mocked)", async () => {
//     const response = await authenticatedSession
//       .post(`/api/tutor/availability`)
//       .send({ days: ["Monday"], times: ["10:00-12:00"] });
//     expect([200, 201, 501]).toContain(response.statusCode);
//   });
// });

// describe("PUT /tutor/availability", () => {
//   it("should update weekly availability (mocked)", async () => {
//     const response = await authenticatedSession
//       .put(`/api/tutor/availability`)
//       .send({ days: ["Tuesday"], times: ["14:00-16:00"] });
//     expect([200, 501]).toContain(response.statusCode);
//   });
// });

// describe("DELETE /tutor/:id/availabilty", () => {
//   it("should delete weekly availability (mocked)", async () => {
//     const response = await authenticatedSession.delete(
//       `/api/tutor/1/availabilty`
//     );
//     expect([200, 204, 501]).toContain(response.statusCode);
//   });
// });
