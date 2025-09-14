const request = require("supertest");
const { cleanupDB } = require("@src/shared/tests/test-db");
const app = require("@src/app");
const session = require("supertest-session");
const { Booking, Subject } = require("@models");
const {
  user,
  createUser,
  createTutor,
  createStudent,
  uuid,
  userObject,
} = require("@src/shared/tests/utils");

let authenticatedSession;
let testSession;
let loggedInUser;
let tutorUser, tutorProfile;
let studentUser, studentProfile;
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
    ],
    { returning: true }
  );
}

const createTutorAndLogin = async () => {
  let { user: loggedInUser } = await createTutor();

  // Login as student
  testSession = session(app);
  await testSession
    .post("/api/auth/login")
    .send({ email: loggedInUser.email, password: userObject.password })
    .expect(200);

  authenticatedSession = testSession;
  loggedInUser = studentUser;
};

const createStudentAndLogin = async () => {
  let { user: loggedInUser } = await createStudent();

  // Login as student
  testSession = session(app);
  await testSession
    .post("/api/auth/login")
    .send({ email: loggedInUser.email, password: userObject.password })
    .expect(200);

  authenticatedSession = testSession;
  loggedInUser = studentUser;
};

describe("Booking API", () => {
  beforeEach(async () => {
    await cleanupDB();
    subjects = await createTestSubjects();
  });

  describe("POST /api/booking/availability", () => {
    it("should allow tutor to create availability", async () => {
      // Login as tutor
      await createTutorAndLogin();
      const now = new Date();
      const start = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 2 hours from now

      const payload = {
        subjectId: subjects[0].id,
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString(),
        tutorNotes: "Available for booking",
      };

      const response = await authenticatedSession
        .post("/api/booking/availability")
        .send(payload);

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: "Availability created successfully",
        data: expect.objectContaining({
          id: expect.any(String),
          tutorId: tutorUser.id,
          subjectId: payload.subjectId,
          scheduledStart: expect.any(String),
          scheduledEnd: expect.any(String),
          tutorNotes: payload.tutorNotes,
          status: "pending",
        }),
      });
    });
  });

  describe("POST /api/booking/:bookingId", () => {
    it("should allow student to book an available slot", async () => {
      // Login as tutor and create availability
      const tutorSession = session(app);
      await tutorSession
        .post("/api/auth/login")
        .send({ email: tutorUser.email, password: "StrongPass123!" })
        .expect(200);

      const now = new Date();
      const start = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const availabilityRes = await tutorSession
        .post("/api/booking/availability")
        .send({
          subjectId: subjects[0].id,
          scheduledStart: start.toISOString(),
          scheduledEnd: end.toISOString(),
          tutorNotes: "Available for booking",
        });
      const bookingId = availabilityRes.body.data.id;

      // Student books the slot
      const response = await authenticatedSession
        .post(`/api/booking/${bookingId}`)
        .send();

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: "Booking created successfully",
        data: expect.objectContaining({
          id: bookingId,
          tutorId: tutorUser.id,
          studentId: studentUser.id,
          subjectId: subjects[0].id,
          scheduledStart: expect.any(String),
          scheduledEnd: expect.any(String),
          status: "pending",
        }),
      });
    });
  });

  describe("GET /api/booking", () => {
    it("should return all bookings for the logged in student", async () => {
      // Login as tutor and create availability
      const tutorSession = session(app);
      await tutorSession
        .post("/api/auth/login")
        .send({ email: tutorUser.email, password: "StrongPass123!" })
        .expect(200);

      const now = new Date();
      const start = new Date(now.getTime() + 3 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const availabilityRes = await tutorSession
        .post("/api/booking/availability")
        .send({
          subjectId: subjects[0].id,
          scheduledStart: start.toISOString(),
          scheduledEnd: end.toISOString(),
          tutorNotes: "Available for booking",
        });
      const bookingId = availabilityRes.body.data.id;

      // Student books the slot
      await authenticatedSession.post(`/api/booking/${bookingId}`).send();

      // Student fetches bookings
      const response = await authenticatedSession.get(`/api/booking/`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Bookings retrieved successfully",
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            tutorId: tutorUser.id,
            studentId: studentUser.id,
            subjectId: subjects[0].id,
            scheduledStart: expect.any(String),
            scheduledEnd: expect.any(String),
            status: "pending",
          }),
        ]),
      });
    });
  });

  describe("GET /api/booking/:bookingId", () => {
    it("should return a booking by id for the student", async () => {
      // Login as tutor and create availability
      const tutorSession = session(app);
      await tutorSession
        .post("/api/auth/login")
        .send({ email: tutorUser.email, password: "StrongPass123!" })
        .expect(200);

      const now = new Date();
      const start = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const availabilityRes = await tutorSession
        .post("/api/booking/availability")
        .send({
          subjectId: subjects[0].id,
          scheduledStart: start.toISOString(),
          scheduledEnd: end.toISOString(),
          tutorNotes: "Available for booking",
        });
      const bookingId = availabilityRes.body.data.id;

      // Student books the slot
      await authenticatedSession.post(`/api/booking/${bookingId}`).send();

      // Student fetches booking by id
      const response = await authenticatedSession.get(
        `/api/booking/${bookingId}`
      );
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Booking retrieved successfully",
        data: expect.objectContaining({
          id: bookingId,
          tutorId: tutorUser.id,
          studentId: studentUser.id,
          subjectId: subjects[0].id,
          scheduledStart: expect.any(String),
          scheduledEnd: expect.any(String),
          status: "pending",
        }),
      });
    });
  });

  describe("PATCH /api/booking/:bookingId/cancel", () => {
    it("should allow student to cancel a booking", async () => {
      // Login as tutor and create availability
      const tutorSession = session(app);
      await tutorSession
        .post("/api/auth/login")
        .send({ email: tutorUser.email, password: "StrongPass123!" })
        .expect(200);

      const now = new Date();
      const start = new Date(now.getTime() + 5 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const availabilityRes = await tutorSession
        .post("/api/booking/availability")
        .send({
          subjectId: subjects[0].id,
          scheduledStart: start.toISOString(),
          scheduledEnd: end.toISOString(),
          tutorNotes: "Available for booking",
        });
      const bookingId = availabilityRes.body.data.id;

      // Student books the slot
      await authenticatedSession.post(`/api/booking/${bookingId}`).send();

      // Student cancels the booking
      const response = await authenticatedSession.patch(
        `/api/booking/${bookingId}/cancel`
      );
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Booking cancelled successfully",
      });
    });
  });
});
