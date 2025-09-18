const express = require("express");
const bookingRouter = express.Router();

const bookingValidator = require("./booking.validator");

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
  bookingController.updateAvailability
);
bookingRouter.patch(
  "/availability/:availabilityId/cancel",
  authMiddleware.requireTutorRole,
  validate(bookingValidator.cancelBookingAvailabilityValidator),
  bookingController.cancelAvailability
);
bookingRouter.delete(
  "/availability/:availabilityId",
  authMiddleware.requireTutorRole,
  bookingController.deleteAvailability
);

//----------------
//Student
bookingRouter.get(
  "/:tutorId",
  authMiddleware.requireStudentRole,
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
  bookingController.fetchStudentBookingById
);
bookingRouter.post(
  "/:bookingId",
  authMiddleware.requireStudentRole,
  bookingController.createBooking
);
bookingRouter.patch(
  "/:bookingId",
  authMiddleware.requireStudentRole,
  validate(bookingValidator.updateBookingValidator),
  bookingController.updateBooking
);
//reject/cancel/reschedule
bookingRouter.patch(
  "/:bookingId/cancel",
  authMiddleware.requireStudentRole,
  bookingController.cancelBooking
);

module.exports = bookingRouter;
