const express = require("express");
const bookingRouter = express.Router();

const bookingValidator = require("./booking.validator");
const idValidator = require("@src/shared/utils/idValidator");
const bookingController = require("./booking.controller");

const authMiddleware = require("@features/auth/auth.middleware");
const validate = require("@src/shared/middlewares/validate.middleware");
const ApiError = require("@src/shared/utils/apiError");

bookingRouter.use(authMiddleware.protectRoute);
bookingRouter.use(authMiddleware.requireVerifiedAndOnboardedUser);

bookingRouter.get("/upcoming", bookingController.fetchUpcomingSession);

//----------------
//Tutor

bookingRouter.get(
  "/availability",
  authMiddleware.requireTutorRole,
  bookingValidator.dateMiddleware,
  bookingController.fetchTutorAvailabilities
);

bookingRouter.get(
  "/availability/:availabilityId",
  authMiddleware.requireTutorRole,
  idValidator("availabilityId"),
  bookingController.fetchTutorAvailability
);
bookingRouter.post(
  "/availability",
  authMiddleware.requireTutorRole,
  validate(bookingValidator.createAvailabilityValidator),
  bookingController.createAvailability
);
bookingRouter.patch(
  "/availability/:availabilityId",
  authMiddleware.requireTutorRole,
  validate(bookingValidator.updateAvailabilityValidator),
  idValidator("availabilityId"),
  bookingController.updateAvailability
);
bookingRouter.patch(
  "/availability/:availabilityId/status",
  authMiddleware.requireTutorRole,
  validate(bookingValidator.updateAvailabilityStatusValidator),
  idValidator("availabilityId"),
  bookingController.updateAvailabilityStatus
);
bookingRouter.patch(
  "/availability/:availabilityId/cancel",
  authMiddleware.requireTutorRole,
  idValidator("availabilityId"),
  validate(bookingValidator.cancelBookingAvailabilityValidator),

  bookingController.cancelAvailability
);
bookingRouter.delete(
  "/availability/:availabilityId",
  authMiddleware.requireTutorRole,
  idValidator("availabilityId"),
  bookingController.deleteAvailability
);

//----------------
//Student
bookingRouter.get(
  "/tutors/:tutorId",
  authMiddleware.requireStudentRole,
  idValidator("tutorId"),
  bookingValidator.dateMiddleware,
  bookingController.fetchStudentTutorBookings
);
bookingRouter.get(
  "/",
  authMiddleware.requireStudentRole,
  bookingValidator.dateMiddleware,
  bookingController.fetchStudentBookings
);

bookingRouter.post(
  "/:bookingId",
  authMiddleware.requireStudentRole,
  idValidator("bookingId"),
  validate(bookingValidator.createBookingValidator),
  bookingController.createBooking
);
bookingRouter.patch(
  "/:bookingId",
  authMiddleware.requireStudentRole,
  validate(bookingValidator.updateBookingValidator),
  idValidator("bookingId"),
  bookingController.updateBooking
);
//reject/cancel/reschedule
bookingRouter.patch(
  "/:bookingId/cancel",
  idValidator("bookingId"),
  authMiddleware.requireStudentRole,
  bookingController.cancelBooking
);

// General booking request
bookingRouter.get(
  "/:bookingId",
  idValidator("bookingId"),
  bookingController.fetchBookingById
);

module.exports = bookingRouter;
