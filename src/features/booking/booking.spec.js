const request = require("supertest");
const { cleanupDB } = require("@src/shared/tests/test-db");
const app = require("@src/app");
const session = require("supertest-session");
const { Booking, Subject } = require("@models");
const {
  createTutor,
  createStudent,
  uuid,
  tutorObject,
  studentObject,
} = require("@src/shared/tests/utils");

let tutorSession, studentSession;

let tutorUser;
let studentUser;
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
  const { user } = await createTutor();
  tutorUser = user;
  // Login as student
  tutorSession = session(app);
  await tutorSession
    .post("/api/auth/login")
    .send({ email: tutorUser.email, password: tutorObject.password })
    .expect(200);
};

const createStudentAndLogin = async () => {
  const { user } = await createStudent();
  studentUser = user;

  // Login as student
  studentSession = session(app);
  await studentSession
    .post("/api/auth/login")
    .send({ email: studentUser.email, password: studentObject.password })
    .expect(200);
};

describe("Booking API", () => {
  beforeEach(async () => {
    await cleanupDB();
    subjects = await createTestSubjects();
  });
  describe("Tutor Routes", () => {
    describe("POST /api/booking/availability", () => {
      it("should allow tutor to create availability", async () => {
        // Login as tutor
        await createTutorAndLogin();
        const now = new Date();
        const start = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour from now
        const end = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now

        const payload = {
          subjectId: subjects[0].id,
          scheduledStart: start,
          scheduledEnd: end,
          tutorNotes: "Available for booking",
        };

        const response = await tutorSession
          .post("/api/booking/availability")
          .send(payload);

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
          success: true,
          message: "Availability created successfully",
          data: expect.objectContaining({
            id: expect.any(String),

            subjectId: payload.subjectId,
            scheduledStart: start,
            scheduledEnd: end,
            tutorNotes: payload.tutorNotes,

            actualEndTime: null,
            actualStartTime: null,
            cancellationReason: null,
            cancelledAt: null,
            cancelledBy: null,
            createdAt: expect.any(String),

            isRecurring: false,
            meetingLink: null,
            parentBookingId: null,
            recurringPattern: null,
            reminderSent: false,

            status: "open",
            studentId: null,
            studentNotes: null,

            tutorId: tutorUser.id,

            updatedAt: expect.any(String),
          }),
        });
      });
    });

    describe("GET /api/booking/availability", () => {
      it("should allow tutor to get their own availability", async () => {
        // Login as tutor
        await createTutorAndLogin();
        const now = new Date();
        const start = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour from now
        const end = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now

        const payload = {
          subjectId: subjects[0].id,
          scheduledStart: start,
          scheduledEnd: end,
          tutorNotes: "Available for booking",
        };

        const response = await tutorSession
          .post("/api/booking/availability")
          .send(payload);

        expect(response.statusCode).toBe(201);

        const availabilityRes = await tutorSession
          .get("/api/booking/availability")
          .expect(200); // 1 hour from now

        expect(availabilityRes.statusCode).toBe(200); // 1 hour from now
        expect(availabilityRes.body).toEqual({
          success: true,
          message: "Availabilities retrieved successfully",
          data: expect.arrayOf({
            id: expect.any(String),
            subjectId: payload.subjectId,
            scheduledStart: start,
            scheduledEnd: end,
            tutorNotes: payload.tutorNotes,
            actualEndTime: null,
            actualStartTime: null,
            cancellationReason: null,
            cancelledAt: null,
            cancelledBy: null,
            createdAt: expect.any(String),
            isRecurring: false,
            meetingLink: null,
            parentBookingId: null,
            recurringPattern: null,
            reminderSent: false,
            status: "open",
            studentId: null,
            studentNotes: null,
            tutorId: tutorUser.id,
            updatedAt: expect.any(String),
          }),
        });
      });
    });

    describe("GET /api/booking/availability/:availabilityId", () => {
      it("should allow tutor to get a specific availability of their own availability", async () => {
        // Login as tutor
        await createTutorAndLogin();
        const now = new Date();
        const start = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour from now
        const end = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now

        const payload = {
          subjectId: subjects[0].id,
          scheduledStart: start,
          scheduledEnd: end,
          tutorNotes: "Available for booking",
        };

        const response = await tutorSession
          .post("/api/booking/availability")
          .send(payload);

        expect(response.statusCode).toBe(201);

        const availabilityRes = await tutorSession
          .get(`/api/booking/availability/${response.body.data.id}`)
          .expect(200); // 1 hour from now

        expect(availabilityRes.statusCode).toBe(200); // 1 hour from now
        expect(availabilityRes.body).toEqual({
          success: true,
          message: "Availability retrieved successfully",
          data: expect.objectContaining({
            id: expect.any(String),
            subjectId: payload.subjectId,
            scheduledStart: start,
            scheduledEnd: end,
            tutorNotes: payload.tutorNotes,
            actualEndTime: null,
            actualStartTime: null,
            cancellationReason: null,
            cancelledAt: null,
            cancelledBy: null,
            createdAt: expect.any(String),
            isRecurring: false,
            meetingLink: null,
            parentBookingId: null,
            recurringPattern: null,
            reminderSent: false,
            status: "open",
            studentId: null,
            studentNotes: null,
            tutorId: tutorUser.id,
            updatedAt: expect.any(String),
          }),
        });
      });
    });

    describe("PATCH /api/booking/availability/:availabilityId", () => {
      it("should allow tutor to update their own availability", async () => {
        // Login as tutor
        await createTutorAndLogin();
        const now = new Date();
        const start = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour from now
        const end = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now

        const payload = {
          subjectId: subjects[0].id,
          scheduledStart: start,
          scheduledEnd: end,
          tutorNotes: "Available for booking",
        };

        const response = await tutorSession
          .post("/api/booking/availability")
          .send(payload); // 1 hour from now

        expect(response.statusCode).toBe(201); // 1 hour from now

        const availabilityId = response.body.data.id;
        const updatedPayload = {
          subjectId: subjects[1].id,
          scheduledStart: start,
          scheduledEnd: end,
          tutorNotes: "Please come early",
        };

        const updateAvailabilityRes = await tutorSession
          .patch(`/api/booking/availability/${availabilityId}`)
          .send(updatedPayload);

        expect(updateAvailabilityRes.statusCode).toBe(200);

        expect(updateAvailabilityRes.body).toEqual({
          success: true,
          message: "Availability updated successfully",
          data: expect.objectContaining({
            id: expect.any(String),
            subjectId: updatedPayload.subjectId,
            scheduledStart: start,
            scheduledEnd: end,
            tutorNotes: updatedPayload.tutorNotes,
            actualEndTime: null,
            actualStartTime: null,
            cancellationReason: null,
            cancelledAt: null,
            cancelledBy: null,
            createdAt: expect.any(String),
            isRecurring: false,
            meetingLink: null,
            parentBookingId: null,
            recurringPattern: null,
            reminderSent: false,
            status: "open",
            studentId: null,
            studentNotes: null,
            tutorId: tutorUser.id,
            updatedAt: expect.any(String),
          }),
        });
      });
    });

    describe("PATCH /api/booking/availability/:availabilityId/cancel", () => {
      it("should allow tutor to cancel their own availability", async () => {
        // Login as tutor
        await createTutorAndLogin();
        const now = new Date();
        const start = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour from now
        const end = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now

        const payload = {
          subjectId: subjects[0].id,
          scheduledStart: start,
          scheduledEnd: end,
          tutorNotes: "Available for booking",
        };

        const response = await tutorSession
          .post("/api/booking/availability")
          .send(payload); // 1 hour from now

        expect(response.statusCode).toBe(201); // 1 hour from now

        const availabilityId = response.body.data.id;
        const cancelPayload = { cancellationReason: "No reason provided" };
        const updateAvailabilityRes = await tutorSession
          .patch(`/api/booking/availability/${availabilityId}/cancel`)
          .send(cancelPayload);
        expect(updateAvailabilityRes.statusCode).toBe(200);

        expect(updateAvailabilityRes.body).toEqual({
          success: true,
          message: "Availability updated successfully",
          data: expect.objectContaining({
            id: expect.any(String),
            subjectId: payload.subjectId,
            scheduledStart: start,
            scheduledEnd: end,
            tutorNotes: payload.tutorNotes,
            actualEndTime: null,
            actualStartTime: null,
            cancellationReason: cancelPayload.cancellationReason,
            cancelledAt: expect.any(String),
            cancelledBy: tutorUser.id,
            createdAt: expect.any(String),
            isRecurring: false,
            meetingLink: null,
            parentBookingId: null,
            recurringPattern: null,
            reminderSent: false,
            status: "cancelled",
            studentId: null,
            studentNotes: null,
            tutorId: tutorUser.id,
            updatedAt: expect.any(String),
          }),
        });
      });
    });
  });

  describe("Student Routes", () => {
    describe("POST /api/booking/:bookingId", () => {
      it("should allow student to book an available slot", async () => {
        // Login as tutor and create availability
        await createTutorAndLogin();
        await createStudentAndLogin();

        const now = new Date();
        const start = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
        const end = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
        const availabilityRes = await tutorSession
          .post("/api/booking/availability")
          .send({
            subjectId: subjects[0].id,
            scheduledStart: start,
            scheduledEnd: end,
            tutorNotes: "Available for booking",
          });

        expect(availabilityRes.statusCode).toBe(201);
        const bookingId = availabilityRes.body.data.id;

        // Student books the slot
        const response = await studentSession
          .post(`/api/booking/${bookingId}`)
          .send();

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
          success: true,
          message: "Booking created successfully",
          data: expect.objectContaining({
            id: expect.any(String),
            subjectId: expect.any(Number),
            scheduledStart: start,
            scheduledEnd: end,
            tutorNotes: expect.any(String),
            actualEndTime: null,
            actualStartTime: null,
            cancellationReason: null,
            cancelledAt: null,
            cancelledBy: null,
            createdAt: expect.any(String),
            isRecurring: false,
            meetingLink: null,
            parentBookingId: null,
            recurringPattern: null,
            reminderSent: false,
            status: "pending",
            studentId: studentUser.id,
            studentNotes: null,
            tutorId: tutorUser.id,
            updatedAt: expect.any(String),
          }),
        });
      });
    });

    describe("GET /api/booking", () => {
      it("should return all bookings for the logged in student", async () => {
        // Login as tutor and create availability
        await createTutorAndLogin();
        await createStudentAndLogin();

        const now = new Date();
        const start = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
        const end = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
        const availabilityRes = await tutorSession
          .post("/api/booking/availability")
          .send({
            subjectId: subjects[0].id,
            scheduledStart: start,
            scheduledEnd: end,
            tutorNotes: "Available for booking",
          });
        const bookingId = availabilityRes.body.data.id;

        // Student books the slot
        await studentSession.post(`/api/booking/${bookingId}`).send();

        // Student fetches bookings
        const response = await studentSession.get(`/api/booking/`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
          success: true,
          message: "Bookings retrieved successfully",
          data: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              subjectId: expect.any(Number),
              scheduledStart: start,
              scheduledEnd: end,
              tutorNotes: expect.any(String),
              actualEndTime: null,
              actualStartTime: null,
              cancellationReason: null,
              cancelledAt: null,
              cancelledBy: null,
              createdAt: expect.any(String),
              isRecurring: false,
              meetingLink: null,
              parentBookingId: null,
              recurringPattern: null,
              reminderSent: false,
              status: "pending",
              studentId: studentUser.id,
              studentNotes: null,
              tutorId: tutorUser.id,
              updatedAt: expect.any(String),
            }),
          ]),
        });
      });
    });

    describe("GET /api/booking/tutors/:tutorId", () => {
      it("should return tutor bookings to student", async () => {
        // Login as tutor and create availability
        await createTutorAndLogin();
        await createStudentAndLogin();

        const now = new Date();
        const start = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
        const end = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
        const availabilityRes = await tutorSession
          .post("/api/booking/availability")
          .send({
            subjectId: subjects[0].id,
            scheduledStart: start,
            scheduledEnd: end,
            tutorNotes: "Available for booking",
          });
        const bookingId = availabilityRes.body.data.id;

        // Student fetches booking by id
        const response = await studentSession.get(
          `/api/booking/tutors/${tutorUser.id}`
        );
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
          success: true,
          message: "Bookings retrieved successfully",
          data: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              subjectId: expect.any(Number),
              scheduledStart: start,
              scheduledEnd: end,
              tutorNotes: expect.any(String),
              actualEndTime: null,
              actualStartTime: null,
              cancellationReason: null,
              cancelledAt: null,
              cancelledBy: null,
              createdAt: expect.any(String),
              isRecurring: false,
              meetingLink: null,
              parentBookingId: null,
              recurringPattern: null,
              reminderSent: false,
              status: "open",
              studentId: null,
              studentNotes: null,
              tutorId: tutorUser.id,
              updatedAt: expect.any(String),
            }),
          ]),
        });
      });
    });

    describe("GET /api/booking/:bookingId", () => {
      it("should return a booking by id for the student", async () => {
        // Login as tutor and create availability
        await createTutorAndLogin();
        await createStudentAndLogin();

        const now = new Date();
        const start = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
        const end = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
        const availabilityRes = await tutorSession
          .post("/api/booking/availability")
          .send({
            subjectId: subjects[0].id,
            scheduledStart: start,
            scheduledEnd: end,
            tutorNotes: "Available for booking",
          });
        const bookingId = availabilityRes.body.data.id;

        // Student books the slot
        await studentSession.post(`/api/booking/${bookingId}`).send();

        // Student fetches booking by id
        const response = await studentSession.get(`/api/booking/${bookingId}`);
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
        await createTutorAndLogin();
        await createStudentAndLogin();

        const now = new Date();
        const start = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
        const end = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
        const availabilityRes = await tutorSession
          .post("/api/booking/availability")
          .send({
            subjectId: subjects[0].id,
            scheduledStart: start,
            scheduledEnd: end,
            tutorNotes: "Available for booking",
          });
        const bookingId = availabilityRes.body.data.id;

        // Student books the slot
        await studentSession.post(`/api/booking/${bookingId}`).send();

        // Student cancels the booking
        const response = await studentSession
          .patch(`/api/booking/${bookingId}/cancel`)
          .send({
            cancellationReason: "No longer available",
          });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
          success: true,
          message: "Booking cancelled successfully",
          data: null,
        });
      });
    });
  });
});
