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

jest.mock("@features/notification/reminderSingleton", () => ({
  scheduleSessionReminder: jest.fn(),
  cancelSessionReminder: jest.fn(),
  rescheduleSessionReminder: jest.fn(),
}));

const tutorMatcher = {
  bio: expect.any(String),
  rating: expect.any(Number),
  profileVisibility: expect.any(String),
  education: expect.any(String),
  timezone: expect.any(String),
  subjects: expect.any(Array),
  user: expect.objectContaining({
    id: expect.any(String),
    firstName: expect.any(String),
    lastName: expect.any(String),
    email: "tutor@example.com",
    profileImageUrl: "randomAvatar",
  }),
};

const studentMatcher = {
  learningGoals: expect.any(Array),
  user: expect.objectContaining({
    email: "student@example.com",
    firstName: "Student",
    id: expect.any(String),
    lastName: "Dupe",
    profileImageUrl: "randomAvatar",
  }),
};

const subjectMatcher = {
  id: expect.any(Number),
  description: expect.any(String),
  name: expect.any(String),
};

const bookingMatcher = (booking = {}) => ({
  id: expect.any(String),
  subject: booking.subject
    ? expect.objectContaining(subjectMatcher)
    : booking.subject === null
      ? null
      : expect.any(Object),
  scheduledStart: expect.any(String),
  scheduledEnd: expect.any(String),
  tutorNotes: booking.tutorNotes || null,
  actualEndTime: null,
  actualStartTime: null,
  cancellationReason: booking.cancellationReason || null,
  cancelledAt: booking.cancelledAt || null,
  cancelledBy: booking.cancelledBy || null,
  meetingLink: null,
  // reminders JSONB
  reminders: expect.objectContaining({
    reminderSlot1: expect.any(Boolean),
    reminderSlot2: expect.any(Boolean),
    reminderSlot3: expect.any(Boolean),
  }),
  status: booking.status || expect.any(String),
  student: booking.student
    ? expect.objectContaining(studentMatcher)
    : booking.student === null
      ? null
      : expect.any(Object),
  studentNotes: booking.studentNotes || null,
  tutor: expect.objectContaining(tutorMatcher),
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

async function createTestBookings() {
  const tutorId = tutorUser.id;
  const studentId = studentUser.id;

  const { user: secondStudent } = await createStudent({
    email: "student2@example.com",
  });
  const { user: secondTutor } = await createTutor({
    email: "tutor2@example.com",
  });
  const now = Date.now();
  const hour = 60 * 60 * 1000;

  const openPastBooking = {
    tutorId: tutorId,
    studentId: null,
    subjectId: null,
    scheduledStart: new Date(now - 4 * hour),
    scheduledEnd: new Date(now - 3 * hour),
    status: "open",
  };

  const openFutureBooking = {
    tutorId: tutorId,
    studentId: null,
    subjectId: subjects[0].id,
    scheduledStart: new Date(now + 7 * hour),
    scheduledEnd: new Date(now + 8 * hour),
    status: "open",
  };
  const pendingFutureBooking = {
    tutorId: tutorId,
    studentId: studentId,
    subjectId: subjects[0].id,
    scheduledStart: new Date(now + 11 * hour),
    scheduledEnd: new Date(now + 12 * hour),
    status: "pending",
  };

  const confirmedBooking = {
    tutorId: tutorId,
    studentId: studentId,
    subjectId: subjects[0].id,
    scheduledStart: new Date(now + 1 * hour),
    scheduledEnd: new Date(now + 2 * hour),
    status: "confirmed",
  };

  const tutorDifferentStudent = {
    tutorId: tutorId,
    studentId: secondStudent.id,
    subjectId: subjects[0].id,
    scheduledStart: new Date(now + 3 * hour),
    scheduledEnd: new Date(now + 4 * hour),
    status: "confirmed",
  };

  const studentDifferentTutor = {
    tutorId: secondTutor.id,
    studentId: studentId,
    subjectId: subjects[0].id,
    scheduledStart: new Date(now + 5 * hour),
    scheduledEnd: new Date(now + 6 * hour),
    status: "confirmed",
  };
  const bookings = await Booking.bulkCreate(
    [
      openPastBooking,
      confirmedBooking,
      tutorDifferentStudent,
      studentDifferentTutor,
      openFutureBooking,
      pendingFutureBooking,
    ],
    {
      returning: true,
    }
  );

  return {
    openBooking: bookings[0],
    confirmedBooking: bookings[1],
    tutorDifferentStudent: bookings[2],
    studentDifferentTutor: bookings[3],
    openFutureBooking: bookings[4],
    pendingFutureBooking: bookings[5],
  };
}

const createTutorAndLogin = async () => {
  const { user } = await createTutor({ subjectIds: [1, 2] });
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
          scheduledStart: start,
          scheduledEnd: end,
          tutorNotes: "Available for booking",
        };

        const response = await tutorSession
          .post("/api/booking/availability")
          .send(payload);

        expect(response.statusCode).toBe(201);

        // top-level success/message
        expect(response.body).toMatchObject({
          success: true,
          message: "Availability created successfully",
        });

        // data sanity
        expect(response.body.data).toMatchObject({
          id: expect.any(String),
          subject: null,
          scheduledStart: start,
          scheduledEnd: end,
          tutorNotes: payload.tutorNotes,
          actualEndTime: null,
          actualStartTime: null,
          cancellationReason: null,
          cancelledAt: null,
          cancelledBy: null,
          meetingLink: null,
          status: "open",
        });

        // nested objects matchers
        expect(response.body.data.tutor).toEqual(
          expect.objectContaining(tutorMatcher)
        );
        expect(response.body.data.student).toBeNull();
        expect(response.body.data.reminders).toEqual(
          expect.objectContaining({
            reminderSlot1: expect.any(Boolean),
            reminderSlot2: expect.any(Boolean),
            reminderSlot3: expect.any(Boolean),
          })
        );
      });
    });

    describe("GET /api/booking/availability", () => {
      it("should allow tutor to get their own availability", async () => {
        // Login as tutor
        await createTutorAndLogin();
        await createStudentAndLogin();
        await createTestBookings();

        const start = new Date().getTime() + 5 * 60 * 60 * 1000;
        const end = new Date().getTime() + 5 * 60 * 60 * 1000;

        const availabilityRes = await tutorSession
          .get(
            `/api/booking/availability?start=${start}&end=${end}&status=open`
          )
          .expect(200);

        expect(availabilityRes.statusCode).toBe(200);
        expect(availabilityRes.body.data.length).toBe(0);

        expect(availabilityRes.body).toMatchObject({
          success: true,
          message: "Availabilities retrieved successfully",
        });

        // data is an array — make sure elements (if any) match the booking shape
        expect(availabilityRes.body.data).toEqual(expect.arrayContaining([]));
      });
    });

    describe("GET /api/booking/availability/:availabilityId", () => {
      it("should allow tutor to get a specific availability of their own availability", async () => {
        // Login as tutor
        await createTutorAndLogin();
        await createStudentAndLogin();
        const { confirmedBooking } = await createTestBookings();

        const availabilityRes = await tutorSession
          .get(`/api/booking/availability/${confirmedBooking.id}`)
          .expect(200);

        expect(availabilityRes.statusCode).toBe(200);
        expect(availabilityRes.body).toMatchObject({
          success: true,
          message: "Availability retrieved successfully",
        });

        expect(availabilityRes.body.data).toMatchObject({
          id: expect.any(String),
          scheduledStart: confirmedBooking.scheduledStart.toISOString(),
          scheduledEnd: confirmedBooking.scheduledEnd.toISOString(),
          tutorNotes: confirmedBooking.tutorNotes,
          actualEndTime: null,
          actualStartTime: null,
          cancellationReason: null,
          cancelledAt: null,
          cancelledBy: null,
          meetingLink: null,
          status: confirmedBooking.status,
        });

        expect(availabilityRes.body.data.tutor).toEqual(
          expect.objectContaining(tutorMatcher)
        );
        expect(availabilityRes.body.data.student).toEqual(
          expect.objectContaining(studentMatcher)
        );
        expect(availabilityRes.body.data.reminders).toEqual(
          expect.objectContaining({
            reminderSlot1: expect.any(Boolean),
            reminderSlot2: expect.any(Boolean),
            reminderSlot3: expect.any(Boolean),
          })
        );
      });
    });

    describe("PATCH /api/booking/availability/:availabilityId", () => {
      it("should allow tutor to update their own availability", async () => {
        // Login as tutor
        await createTutorAndLogin();
        await createStudentAndLogin();
        const { confirmedBooking } = await createTestBookings();

        const now = new Date();
        const start = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour from now
        const end = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now

        const availabilityId = confirmedBooking.id;
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

        expect(updateAvailabilityRes.body).toMatchObject({
          success: true,
          message: "Availability updated successfully",
        });

        expect(updateAvailabilityRes.body.data).toMatchObject({
          id: expect.any(String),
          scheduledStart: updatedPayload.scheduledStart,
          scheduledEnd: updatedPayload.scheduledEnd,
          tutorNotes: updatedPayload.tutorNotes,
          actualEndTime: null,
          actualStartTime: null,
          cancellationReason: null,
          cancelledAt: null,
          cancelledBy: null,
          meetingLink: null,
          status: confirmedBooking.status,
        });

        expect(updateAvailabilityRes.body.data.tutor).toEqual(
          expect.objectContaining(tutorMatcher)
        );
        expect(updateAvailabilityRes.body.data.subject).toEqual(
          expect.objectContaining(subjectMatcher)
        );
      });
    });

    describe("PATCH /api/booking/availability/:availabilityId/status", () => {
      it("should allow tutor to confirm or reject booking", async () => {
        // Login as tutor
        await createTutorAndLogin();
        await createStudentAndLogin();

        const { pendingFutureBooking } = await createTestBookings();

        const availabilityId = pendingFutureBooking.id;
        const statusPayload = {
          status: "confirmed",
        };

        const updateAvailabilityRes = await tutorSession
          .patch(`/api/booking/availability/${availabilityId}/status`)
          .send(statusPayload);

        expect(updateAvailabilityRes.statusCode).toBe(200);

        expect(updateAvailabilityRes.body).toMatchObject({
          success: true,
          message: "Availability status updated successfully",
        });

        expect(updateAvailabilityRes.body.data).toMatchObject({
          id: expect.any(String),
          scheduledStart: pendingFutureBooking.scheduledStart.toISOString(),
          scheduledEnd: pendingFutureBooking.scheduledEnd.toISOString(),
          tutorNotes: pendingFutureBooking.tutorNotes,
          actualEndTime: null,
          actualStartTime: null,
          cancellationReason: null,
          cancelledAt: null,
          cancelledBy: null,
          meetingLink: null,
          status: statusPayload.status,
        });

        expect(updateAvailabilityRes.body.data.tutor).toEqual(
          expect.objectContaining(tutorMatcher)
        );
        expect(updateAvailabilityRes.body.data.student).toEqual(
          expect.objectContaining(studentMatcher)
        );
      });
    });

    describe("PATCH /api/booking/availability/:availabilityId/cancel", () => {
      it("should allow tutor to cancel their own availability", async () => {
        // Login as tutor
        await createTutorAndLogin();
        await createStudentAndLogin();
        const { pendingFutureBooking } = await createTestBookings();

        const availabilityId = pendingFutureBooking.id;
        const cancelPayload = { cancellationReason: "No reason provided" };
        const updateAvailabilityRes = await tutorSession
          .patch(`/api/booking/availability/${availabilityId}/cancel`)
          .send(cancelPayload);
        expect(updateAvailabilityRes.statusCode).toBe(200);

        expect(updateAvailabilityRes.body).toMatchObject({
          success: true,
          message: "Availability updated successfully",
        });

        expect(updateAvailabilityRes.body.data).toMatchObject({
          id: pendingFutureBooking.id,
          scheduledStart: expect.any(String),
          scheduledEnd: expect.any(String),
          tutorNotes: null,
          actualEndTime: null,
          actualStartTime: null,
          cancellationReason: cancelPayload.cancellationReason,
          cancelledBy: tutorUser.id,
          meetingLink: null,
          status: "cancelled",
        });

        // cancelledAt is a timestamp string
        expect(updateAvailabilityRes.body.data.cancelledAt).toEqual(
          expect.any(String)
        );
      });
    });
  });

  describe("Student Routes", () => {
    describe("POST /api/booking/:bookingId", () => {
      it("should allow student to book an available slot", async () => {
        // Login as tutor and create availability
        await createTutorAndLogin();
        await createStudentAndLogin();

        const { openFutureBooking } = await createTestBookings();

        const bookingId = openFutureBooking.id;
        // Student books the slot
        const response = await studentSession
          .post(`/api/booking/${bookingId}`)
          .send({ subjectId: subjects[0].id });

        expect(response.statusCode).toBe(201);

        expect(response.body).toMatchObject({
          success: true,
          message: "Booking created successfully",
        });

        // data checks
        expect(response.body.data).toMatchObject({
          id: expect.any(String),
          scheduledStart: expect.any(String),
          scheduledEnd: expect.any(String),
          tutorNotes: null,
          actualEndTime: null,
          actualStartTime: null,
          cancellationReason: null,
          cancelledAt: null,
          cancelledBy: null,
          meetingLink: null,
          status: "pending",
        });

        expect(response.body.data.reminders).toEqual(
          expect.objectContaining({
            reminderSlot1: expect.any(Boolean),
            reminderSlot2: expect.any(Boolean),
            reminderSlot3: expect.any(Boolean),
          })
        );
        expect(response.body.data.tutor).toEqual(
          expect.objectContaining(tutorMatcher)
        );
        expect(response.body.data.student).toEqual(
          expect.objectContaining(studentMatcher)
        );
      });
    });

    describe("GET /api/booking", () => {
      it("should return all bookings for the logged in student", async () => {
        // Login as tutor and create availability
        await createTutorAndLogin();
        await createStudentAndLogin();

        await createTestBookings();

        // Student fetches bookings
        const response = await studentSession.get(`/api/booking/`);
        expect(response.statusCode).toBe(200);

        expect(response.body).toMatchObject({
          success: true,
          message: "Bookings retrieved successfully",
        });

        expect(response.body.data).toEqual(
          expect.arrayContaining([expect.objectContaining(bookingMatcher())])
        );
      });
    });

    describe("GET /api/booking/tutors/:tutorId", () => {
      it("should return tutor bookings to student", async () => {
        // Login as tutor and create availability
        await createTutorAndLogin();
        await createStudentAndLogin();
        const { confirmedBooking, openFutureBooking, pendingFutureBooking } =
          await createTestBookings();

        // Use a valid ISO string for the start date
        const startDate = new Date().toISOString();

        const response = await studentSession.get(
          `/api/booking/tutors/${tutorUser.id}?start=${encodeURIComponent(startDate)}&status=open`
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.data.length).toBe(1);

        expect(response.body).toMatchObject({
          success: true,
          message: "Bookings retrieved successfully",
        });

        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining(bookingMatcher({ status: "open" })),
          ])
        );
      });
    });

    describe("GET /api/booking/:bookingId", () => {
      it("should return a booking by id for the student", async () => {
        // Login as tutor and create availability
        await createTutorAndLogin();
        await createStudentAndLogin();

        const { confirmedBooking } = await createTestBookings();
        // Student fetches booking by id
        const response = await studentSession.get(
          `/api/booking/${confirmedBooking.id}`
        );
        expect(response.statusCode).toBe(200);

        expect(response.body).toMatchObject({
          success: true,
          message: "Booking retrieved successfully",
        });

        expect(response.body.data).toMatchObject({
          id: confirmedBooking.id,
          scheduledStart: expect.any(String),
          scheduledEnd: expect.any(String),
          tutorNotes: null,
          actualEndTime: null,
          actualStartTime: null,
          cancellationReason: null,
          cancelledAt: null,
          cancelledBy: null,
          meetingLink: null,
          status: confirmedBooking.status,
        });

        expect(response.body.data.tutor).toEqual(
          expect.objectContaining(tutorMatcher)
        );
        expect(response.body.data.student).toEqual(
          expect.objectContaining(studentMatcher)
        );
      });
    });

    describe("PATCH /api/booking/:bookingId/cancel", () => {
      it("should allow student to cancel a booking", async () => {
        // Login as tutor and create availability
        await createTutorAndLogin();
        await createStudentAndLogin();

        const { confirmedBooking } = await createTestBookings();
        const bookingId = confirmedBooking.id;

        // Student cancels the booking
        const response = await studentSession
          .patch(`/api/booking/${bookingId}/cancel`)
          .send({
            cancellationReason: "No longer available",
          });
        expect(response.statusCode).toBe(200);

        expect(response.body).toMatchObject({
          success: true,
          message: "Booking cancelled successfully",
          data: null,
        });
      });
    });
  });
  describe("GET /api/booking/upcoming", () => {
    it("should allow student to fetch their upcoming booking", async () => {
      // Login as tutor and create availability
      await createTutorAndLogin();
      await createStudentAndLogin();

      const { confirmedBooking } = await createTestBookings();

      // Student fetches upcoming booking
      const studentResponse = await studentSession
        .get(`/api/booking/upcoming`)
        .send();

      expect(studentResponse.statusCode).toBe(200);

      expect(studentResponse.body).toMatchObject({
        success: true,
        message: expect.any(String),
      });

      expect(studentResponse.body.data).toMatchObject({
        id: confirmedBooking.id,
        scheduledStart: expect.any(String),
        scheduledEnd: expect.any(String),
        tutorNotes: null,
        actualEndTime: null,
        actualStartTime: null,
        cancellationReason: null,
        cancelledAt: null,
        cancelledBy: null,
        meetingLink: null,
        status: "confirmed",
      });

      expect(studentResponse.body.data.tutor).toEqual(
        expect.objectContaining(tutorMatcher)
      );
      expect(studentResponse.body.data.student).toEqual(
        expect.objectContaining(studentMatcher)
      );

      const tutorResponse = await tutorSession
        .get(`/api/booking/upcoming`)
        .send();

      expect(tutorResponse.statusCode).toBe(200);
      expect(tutorResponse.body).toMatchObject({
        success: true,
        message: expect.any(String),
      });
      expect(tutorResponse.body.data).toMatchObject({
        id: confirmedBooking.id,
        scheduledStart: expect.any(String),
        scheduledEnd: expect.any(String),
        tutorNotes: null,
        actualEndTime: null,
        actualStartTime: null,
        cancellationReason: null,
        cancelledAt: null,
        cancelledBy: null,
        meetingLink: null,
        status: "confirmed",
      });
    });
  });
});
describe("Date middleware", () => {
  const dateMiddleware = require("./booking.validator").dateMiddleware;

  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
    };
    res = {};
    next = jest.fn();
  });

  it("should set date with time  when valid date string is provided", () => {
    req.query.start = "2023-12-25";
    req.query.end = "2023-12-25";

    dateMiddleware(req, res, next);

    const expectedDate = new Date("2023-12-25");

    expect(req.parsedDates.start).toBeInstanceOf(Date);

    expect(req.parsedDates.start.getTime()).toBe(expectedDate.getTime());
    expect(req.parsedDates.end.getTime()).toBe(expectedDate.getTime());

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should handle ISO date format correctly", () => {
    req.query.start = "2023-12-25T15:30:45.123Z";

    dateMiddleware(req, res, next);

    const expectedDate = new Date("2023-12-25T15:30:45.123Z");

    expect(req.parsedDates.start).toBeInstanceOf(Date);
    expect(req.parsedDates.start.getTime()).toBe(expectedDate.getTime());

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should handle numeric timestamp", () => {
    req.query.start = "1640390400000"; // timestamp for 2021-12-25
    dateMiddleware(req, res, next);

    const expectedDate = new Date(1640390400000);
    expect(req.parsedDates.start).toBeInstanceOf(Date);
    expect(req.parsedDates.start.getTime()).toBe(expectedDate.getTime());

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should return next with ApiError for invalid date strings", () => {
    req.query.start = "invalid-date-string";
    req.query.end = "invalid-date-string";

    dateMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Invalid start date",
      })
    );
  });

  it("should ignore empty string date", () => {
    req.query.start = "";

    dateMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should handle date format like MM/DD/YYYY", () => {
    req.query.start = "12/25/2023";

    dateMiddleware(req, res, next);

    const expectedDate = new Date("12/25/2023");

    expect(req.parsedDates.start.getTime()).toBe(expectedDate.getTime());

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should return next with Apierror if end is before start", () => {
    req.query.start = "12/25/2023";
    req.query.end = "12/24/2023";

    dateMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Start date must be before end date",
      })
    );
  });
});
