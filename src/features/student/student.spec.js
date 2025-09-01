const request = require("supertest");
const { cleanupDB } = require("@src/shared/tests/test-db");
const sequelize = require("@src/shared/database/index");
const app = require("@src/app");
const { User, Student, Subject, Exam } = require("@models");
const session = require("supertest-session");
const { test } = require("@src/shared/config/db.config");
const {
  createVerifiedUser,
  userObject: user,
  uuid,
} = require("@src/shared/tests/utils");

let authenticatedSession;
let testSession;
let loggedInUser;
let subjects;

jest.mock("@src/shared/middlewares/rateLimit.middleware", () => {
  return () => (req, res, next) => next();
});

async function createTestExams() {
  Exam.bulkCreate([
    { name: "NECO", description: "", is_active: true },
    { name: "WAEC", description: "", is_active: true },
  ]);
}
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
  const users = await User.bulkCreate(
    Array.from({ length: count }).map((_, i) => ({
      email: `student${i}@test.com`,
      firstName: `Student${i}`,
      lastName: `Test${i}`,
      passwordHash: "password123",
      role: "student",
      isVerified: true,
    })),
    { returning: true }
  );
  const students = await Student.bulkCreate(
    users.map((user, i) => ({
      userId: user.id,
      gradeLevel: `Grade ${i + 1}`,
      learningGoals: `Learning goals for student ${i}`,
    })),
    { returning: true }
  );
  await students.map(async (student, i) => {
    const numSubjectsForStudent = i + 1;
    const startIndex = i * numSubjectsForStudent;
    const endIndex = startIndex + numSubjectsForStudent;
    const slice = subjects.slice(startIndex, endIndex);
    return await student.setSubjects(slice);
  });
  return students;
}

const studentProfile = {
  gradeLevel: "Grade 10",
  learningGoals: ["Prepare for exams"],
  exams: [1, 2],
  subjects: [1, 2],
};
const updatedProfile = {
  gradeLevel: "Grade 11",
  learningGoals: "Advanced studies",
  subjects: [2, 3],
};

describe("Student test", () => {
  beforeEach(async () => {
    await cleanupDB();
    subjects = await createTestSubjects();
    await createTestExams();
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

  describe("POST /student/", () => {
    it("should create student and return student details", async () => {
      const response = await authenticatedSession
        .post(`/api/student/`)
        .send(studentProfile);
      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: "Onboarding successful",
        data: expect.objectContaining({
          email: user.email,
          exams: expect.arrayOf(expect.any(String)),
          firstName: user.firstName,
          id: expect.any(String),
          lastName: user.lastName,
          subjects: expect.arrayOf(expect.any(String)),
          //   gradeLevel: studentProfile.gradeLevel,
          //   learningGoals: studentProfile.learningGoals,
        }),
      });
    });
  });

  describe("GET /student", () => {
    beforeEach(async () => {
      await createTestStudents();
    });
    it("should return all students", async () => {
      const response = await authenticatedSession.get(`/api/student/`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Students list fetched",
        data: {
          count: expect.any(Number),
          rows: expect.arrayOf(
            expect.objectContaining({
              email: expect.any(String),
              exams: expect.arrayOf(expect.any(String)),
              firstName: expect.any(String),
              id: expect.any(String),
              lastName: expect.any(String),
              subjects: expect.arrayOf(expect.any(String)),
              //   gradeLevel: studentProfile.gradeLevel,
              //   learningGoals: studentProfile.learningGoals,
            })
          ),
        },
      });
    });

    it("should return 404 for non-existent student", async () => {
      const response = await authenticatedSession.get(
        `/api/student/44e54e24-7e94-476c-b6e7-0bf0e2b1567e`
      );
      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: "Student not found",
        error: null,
      });
    });

    it("should return students for subjects", async () => {
      const response = await authenticatedSession.get(
        `/api/student/?subjects=English,Mathematics`
      );
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Students retrieved successfully",
        data: {
          count: expect.any(Number),
          rows: expect.any(Array),
        },
      });
    });
  });

  describe("GET /student/:id", () => {
    it("should return a student profile by id", async () => {
      const students = await createTestStudents(1);
      const student = students[0];
      const response = await authenticatedSession.get(
        `/api/student/${student.userId}`
      );
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Student fetched",
        data: expect.objectContaining({
          id: expect.any(String),
          //   gradeLevel: student.gradeLevel,
          //   learningGoals: student.learningGoals,
          email: expect.any(String),
          exams: expect.any(Array),
          firstName: expect.any(String),
          lastName: expect.any(String),
          subjects: expect.any(Array),
        }),
      });
    });

    it("should return 404 if student does not exist", async () => {
      const students = await createTestStudents(5);
      const studentId = uuid();
      const response = await authenticatedSession.get(
        `/api/student/${studentId}`
      );
      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: "Student not found",
        error: null,
      });
    });
  });

  describe("PUT /student/:id", () => {
    it("should update student profile if user is owner", async () => {
      const postRes = await authenticatedSession
        .post(`/api/student/`)
        .send(studentProfile);
      expect(postRes.statusCode).toEqual(201);
      const response = await authenticatedSession
        .put(`/api/student/${loggedInUser.id}`)
        .send(updatedProfile);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "success",
        data: expect.objectContaining({
          gradeLevel: updatedProfile.gradeLevel,
          learningGoals: updatedProfile.learningGoals,
          subjects: expect.any(Array),
        }),
      });
    });
    it("should return 400 if student profile not complete", async () => {
      const response = await authenticatedSession
        .put(`/api/student/${loggedInUser.id}`)
        .send({});
      expect([400, 422]).toContain(response.statusCode);
    });
    it("should return 403 if user is not owner", async () => {
      const students = await createTestStudents(1);
      const student = students[0];
      const response = await authenticatedSession
        .put(`/api/student/${uuid()}`)
        .send(updatedProfile);
      expect(response.statusCode).toBe(403);
      expect(response.body).toEqual({
        error: null,
        message: "Please complete onboarding to access this resource",
        success: false,
      });
    });
  });
});
