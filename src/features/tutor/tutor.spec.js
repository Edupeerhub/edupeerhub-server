const request = require("supertest");
const { cleanupDB } = require("@src/shared/tests/test-db");

const sequelize = require("@src/shared/database/index");
const app = require("@src/app");
const { User, Tutor, Subject, Student } = require("@models");

const session = require("supertest-session");
const { test } = require("@src/shared/config/db.config");
const {
  createUser,
  userObject: user,
  uuid,
} = require("@src/shared/tests/utils");
const { error } = require("winston");
const { meta } = require("@eslint/js");

let authenticatedSession;
let testSession;
let loggedInUser;
let subjects;

jest.mock("@src/shared/middlewares/rateLimit.middleware", () => {
  return jest.fn(() => (req, res, next) => next());
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
      passwordHash: "password123", // hashed via hooks
      role: "student",
      profileImageUrl: "randomAvatar",
      isVerified: true,
    })),
    { returning: true }
  );

  // Create student profiles
  const students = await Student.bulkCreate(
    users.map((user, i) => ({
      userId: user.id,
      gradeLevel: `Grade ${i + 1}`,
      learningGoals: [`Learning goals for student ${i}`], // ✅ array
    })),
    { returning: true }
  );

  // Link subjects properly
  await Promise.all(
    students.map(async (student, i) => {
      const numSubjects = Math.min(subjects.length, i + 1);
      const assignedSubjects = subjects.slice(0, numSubjects);
      await student.setSubjects(assignedSubjects);
    })
  );

  return students;
}

async function createTestTutors(count = 5) {
  console.log("Creating test tutors");

  const users = await User.bulkCreate(
    Array.from({ length: count }).map((_, i) => ({
      email: `tutor${i}@test.com`,
      firstName: `Tutor${i}`,
      lastName: `Test${i}`,
      passwordHash: "password123",
      role: "tutor",
      profileImageUrl: "randomAvatar",
      isVerified: true,
    })),
    { returning: true }
  );

  const tutors = await Tutor.bulkCreate(
    users.map((user, i) => ({
      userId: user.id,
      bio: `Bio for tutor ${i}`,
      rating: Number(`${i}.${i}`),
      education: `Education ${i}`,
      timezone: "UTC+0",
      approvalStatus: i % 2 === 0 ? "approved" : "pending",
      profileVisibility: i % 2 === 0 ? "active" : "hidden",
    })),
    { returning: true }
  );

  await Promise.all(
    tutors.map(async (tutor, i) => {
      const numSubjects = Math.min(subjects.length, i + 1);
      const assignedSubjects = subjects.slice(0, numSubjects);
      await tutor.setSubjects(assignedSubjects);
    })
  );

  return tutors;
}

const tutor = {
  bio: "I am a tutor",
  education: "BSc Early Child Education",
  timezone: "UTC",
  subjects: [1],
};
const updatedProfile = {
  bio: "I am the best tutor",
  rating: 5.0,
  approvalStatus: "approved",
  profileVisibility: "active",
  education: "BSc Early Child Education",
  timezone: "UTC+2",
  subjects: [1, 2, 3],
};

const tutorValidator = {
  // profileVisibility: "hidden",
  userId: expect.any(String),
  bio: expect.any(String),
  education: expect.any(String),
  timezone: expect.any(String),
  rating: expect.any(Number),
  subjects: expect.any(Array),
  // approvalStatus: "pending",
  // userId: expect.any(String),
  // updatedAt: expect.any(String),
  // createdAt: expect.any(String),
  // deletedAt: null,
  // rejectionReason: null,
  user: expect.objectContaining({
    email: expect.any(String),
    firstName: expect.any(String),
    lastName: expect.any(String),
    profileImageUrl: expect.any(String),
  }),
};

const metaMatcher = {
  count: expect.any(Number),
  page: expect.any(Number),
  limit: expect.any(Number),
  total: expect.any(Number),
};
describe("Tutor test", () => {
  beforeEach(async () => {
    console.log("Top level before each");
    await cleanupDB();
    subjects = await createTestSubjects();

    testSession = session(app);
    loggedInUser = await createUser({});
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
        subjects: [1, 2, 3],
      };

      const response = await authenticatedSession
        .post(`/api/tutor/`)
        .send(tutor);

      expect(response.statusCode).toBe(201);
      expect(response.body.data.subjects.length).toBe(tutor.subjects.length);
      expect(response.body).toEqual({
        success: true,
        message: "Onboarding successful",
        data: tutorValidator,
      });
    });
  });

  describe("GET /tutor", () => {
    beforeEach(async () => {
      await createTestTutors();
    });
    it("should return filtered tutors", async () => {
      // await createTestTutors();

      const response = await authenticatedSession.get(
        `/api/tutor/?page=1&limit=10&ratings=1,2,3,4,5`
      );
      console.log(JSON.stringify(response.body.data));
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Tutors retrieved successfully",
        data: expect.arrayOf(tutorValidator),
        meta: expect.objectContaining(metaMatcher),
      });

      console.log(response.body.data);
    });

    it("should return tutor for subjects", async () => {
      const response = await authenticatedSession.get(`/api/tutor/?subjects=1`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data).toEqual(
        expect.arrayContaining([expect.objectContaining(tutorValidator)])
      );
      expect(response.body).toEqual({
        success: true,
        message: "Tutors retrieved successfully",
        data: expect.arrayOf(tutorValidator),
        meta: expect.objectContaining(metaMatcher),
      });
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
        data: tutorValidator,
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
      expect(response.body.data.subjects.length).toBe(
        updatedProfile.subjects.length
      );
      expect(response.body).toEqual({
        success: true,
        message: "success",
        data: expect.objectContaining({
          // approvalStatus: updatedProfile.approvalStatus,
          bio: updatedProfile.bio,
          // createdAt: expect.any(String),
          education: updatedProfile.education,
          // profileVisibility: updatedProfile.profileVisibility,
          rating: 0, // shouldn't be able to update rating
          // rejectionReason: null,
          subjects: expect.arrayOf(
            expect.objectContaining({
              description: expect.any(String),
              id: expect.any(Number),
              name: expect.any(String),
            })
          ),
          timezone: updatedProfile.timezone,
          // updatedAt: expect.any(String),
          // userId: loggedInUser.id,
          user: expect.objectContaining({
            email: expect.any(String),
            firstName: expect.any(String),
            lastName: expect.any(String),
            profileImageUrl: expect.any(String),
          }),
        }),
      });
    });
    it("should return 400 if tutor profile not complete", async () => {
      const postRes = await authenticatedSession
        .post(`/api/tutor/`)
        .send(tutor);

      const createdTutor = postRes.body.data;

      const response = await authenticatedSession
        .put(`/api/tutor/${loggedInUser.id}`)
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
          message: "Access denied - Tutor only",
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
        learningGoals: [`Learning goals for student ${1}`],
      });
      await student.addSubjects(subjects);
      const response = await authenticatedSession.get(
        `/api/tutor/recommendations`
      );
      expect(response.statusCode).toBe(200);
      expect(response.body.meta.count).toBeLessThan(5);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data).toEqual(
        expect.arrayContaining([expect.objectContaining(tutorValidator)])
      );
      expect(response.body).toEqual({
        success: true,
        message: "success",
        meta: expect.objectContaining(metaMatcher),

        data: expect.arrayOf(tutorValidator),
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
