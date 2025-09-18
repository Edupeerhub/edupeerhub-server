const express = require("express");
const bookingRouter = express.Router();

const bookingValidator = require("./booking.validator");
const idValidator = require("@src/shared/utils/idValidator");
const bookingController = require("./booking.controller");

const authMiddleware = require("@features/auth/auth.middleware");
const validate = require("@src/shared/middlewares/validate.middleware");

const dateMiddleware = (req, res, next) => {
  if (!req.query.date) {
    req.params.date = new Date(new Date().setHours(0, 0, 0, 0));
  } else {
    req.params.date = new Date(new Date(req.query.date).setHours(0, 0, 0, 0));
  }

  next();
};

bookingRouter.use(authMiddleware.protectRoute);
bookingRouter.use(authMiddleware.requireVerifiedAndOnboardedUser);

//----------------
//Tutor

bookingRouter.get(
  "/availability",
  authMiddleware.requireTutorRole,
  dateMiddleware,
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
  dateMiddleware,
  bookingController.fetchStudentTutorBookings
);
bookingRouter.get(
  "/",
  authMiddleware.requireStudentRole,
  dateMiddleware,
  bookingController.fetchStudentBookings
);
bookingRouter.get(
  "/:bookingId",
  authMiddleware.requireStudentRole,
  idValidator("bookingId"),
  bookingController.fetchStudentBookingById
);
bookingRouter.post(
  "/:bookingId",
  authMiddleware.requireStudentRole,
  idValidator("bookingId"),
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

module.exports = bookingRouter;
