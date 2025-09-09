const request = require("supertest");
const { cleanupDB } = require("@src/shared/tests/test-db");
const sequelize = require("@src/shared/database/index");
const app = require("@src/app");
const { User, Student, Subject, Exam } = require("@models");
const session = require("supertest-session");
const {
  createUser,
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
  return await Exam.bulkCreate(
    [
      { name: "NECO", description: "", is_active: true },
      { name: "WAEC", description: "", is_active: true },
    ],
    { returning: true }
  );
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
      isOnboarded: true,
    })),
    { returning: true }
  );

  const students = await Student.bulkCreate(
    users.map((user, i) => ({
      userId: user.id,
      gradeLevel: `Grade ${i + 1}`,
      learningGoals: [`Learning goals for student ${i}`],
    })),
    { returning: true }
  );

  await Promise.all(
    students.map(async (student, i) => {
      const slice = subjects.slice(i, i + 2);
      await student.setSubjects(slice);
    })
  );

  const exams = await Exam.findAll();
  await Promise.all(students.map((student) => student.setExams(exams)));

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
  learningGoals: ["Advanced studies"],
  subjects: [2, 3],
};

describe("Student test", () => {
  beforeEach(async () => {
    await cleanupDB();
    subjects = await createTestSubjects();
    await createTestExams();
    testSession = session(app);
    loggedInUser = await createUser({ isOnboarded: true, verified: true });
    await testSession
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password })
      .expect(200);
    authenticatedSession = testSession;
  });

  describe("POST /student/", () => {
    it("should create student and return student details", async () => {
      const response = await authenticatedSession
        .post(`/api/student/`)
        .send(studentProfile);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Onboarding successful");

      const data = response.body.data;
      expect(typeof data.userId).toBe("string");
      expect(Array.isArray(data.learningGoals)).toBe(true);
      expect(data.learningGoals).toContain("Prepare for exams");
      expect(Array.isArray(data.exams)).toBe(true);
      expect(data.exams.length).toBeGreaterThan(0);
      expect(typeof data.exams[0].id).toBe("number");
      expect(typeof data.exams[0].name).toBe("string");
      expect(Array.isArray(data.subjects)).toBe(true);
      expect(data.subjects.length).toBeGreaterThan(0);
      expect(typeof data.subjects[0].id).toBe("number");
      expect(typeof data.subjects[0].name).toBe("string");
      expect(typeof data.subjects[0].description).toBe("string");
      expect(typeof data.user.id).toBe("string");
      expect(typeof data.user.email).toBe("string");
      expect(typeof data.user.firstName).toBe("string");
      expect(typeof data.user.lastName).toBe("string");
      expect(data.user.role).toBe("student");
    });
  });

  describe("GET /student", () => {
    beforeEach(async () => {
      await createTestStudents();
    });

    it("should return all students", async () => {
      const response = await authenticatedSession.get(`/api/student/`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Students list fetched");

      const data = response.body.data;
      expect(typeof data.count).toBe("number");
      expect(Array.isArray(data.rows)).toBe(true);
      expect(data.rows.length).toBeGreaterThan(0);

      const firstStudent = data.rows[0];
      expect(typeof firstStudent.userId).toBe("string");
      expect(typeof firstStudent.gradeLevel).toBe("string");
      expect(Array.isArray(firstStudent.learningGoals)).toBe(true);
      expect(Array.isArray(firstStudent.exams)).toBe(true);
      expect(firstStudent.exams.length).toBeGreaterThan(0);
      expect(typeof firstStudent.exams[0].id).toBe("number");
      expect(typeof firstStudent.exams[0].name).toBe("string");
      expect(Array.isArray(firstStudent.subjects)).toBe(true);
      expect(typeof firstStudent.user.id).toBe("string");
      expect(typeof firstStudent.user.email).toBe("string");
      expect(typeof firstStudent.user.firstName).toBe("string");
      expect(typeof firstStudent.user.lastName).toBe("string");
      expect(firstStudent.user.role).toBe("student");
    });

    it("should return 404 for non-existent student", async () => {
      const response = await authenticatedSession.get(`/api/student/${uuid()}`);
      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: "Student does not exist",
        error: null,
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
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Student fetched");

      const data = response.body.data;
      expect(typeof data.userId).toBe("string");
      expect(typeof data.gradeLevel).toBe("string");
      expect(Array.isArray(data.learningGoals)).toBe(true);
      expect(Array.isArray(data.exams)).toBe(true);
      expect(data.exams.length).toBeGreaterThan(0);
      expect(typeof data.exams[0].id).toBe("number");
      expect(typeof data.exams[0].name).toBe("string");
      expect(Array.isArray(data.subjects)).toBe(true);
      expect(data.subjects.length).toBeGreaterThan(0);
      expect(typeof data.subjects[0].id).toBe("number");
      expect(typeof data.subjects[0].name).toBe("string");
      expect(typeof data.subjects[0].description).toBe("string");
      expect(typeof data.user.id).toBe("string");
      expect(typeof data.user.email).toBe("string");
      expect(typeof data.user.firstName).toBe("string");
      expect(typeof data.user.lastName).toBe("string");
      expect(data.user.role).toBe("student");
    });

    it("should return 404 if student does not exist", async () => {
      const response = await authenticatedSession.get(`/api/student/${uuid()}`);
      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: "Student does not exist",
        error: null,
      });
    });
  });

  describe("PUT /student/:id", () => {
    it("should update student profile if user is owner", async () => {
      await authenticatedSession.post(`/api/student/`).send(studentProfile);
      const response = await authenticatedSession
        .put(`/api/student/${loggedInUser.id}`)
        .send(updatedProfile);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Student updated");

      const data = response.body.data;
      expect(data.gradeLevel).toBe(updatedProfile.gradeLevel);
      expect(data.learningGoals).toEqual(updatedProfile.learningGoals);
      expect(Array.isArray(data.subjects)).toBe(true);
      expect(data.subjects.length).toBeGreaterThan(0);
      expect(typeof data.subjects[0].id).toBe("number");
      expect(typeof data.subjects[0].name).toBe("string");
      expect(Array.isArray(data.exams)).toBe(true);
      expect(data.exams.length).toBeGreaterThan(0);
      expect(typeof data.exams[0].id).toBe("number");
      expect(typeof data.exams[0].name).toBe("string");
      expect(typeof data.userId).toBe("string");
      expect(typeof data.user.id).toBe("string");
      expect(typeof data.user.email).toBe("string");
      expect(typeof data.user.firstName).toBe("string");
      expect(typeof data.user.lastName).toBe("string");
      expect(data.user.role).toBe("student");
    });

    it("should return 403 if user is not owner", async () => {
      const students = await createTestStudents(1);
      const student = students[0];
      const response = await authenticatedSession
        .put(`/api/student/${student.userId}`)
        .send(updatedProfile);
      expect(response.statusCode).toBe(403);
      expect(response.body).toEqual({
        success: false,
        message: "Forbidden",
        error: null,
      });
    });
  });
});
