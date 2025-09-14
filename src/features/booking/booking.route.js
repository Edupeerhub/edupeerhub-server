const express = require("express");
const bookingRouter = express.Router();

const {
  createAvailabilityValidator,
  updateAvailabilityValidator,
  cancelBookingAvailabilityValidator,
} = require("./booking.validator");

const bookingController = require("./booking.controller");

const authMiddleware = require("@features/auth/auth.middleware");
const validate = require("@src/shared/middlewares/validate.middleware");

bookingRouter.use(authMiddleware.protectRoute);
bookingRouter.use(authMiddleware.requireVerifiedAndOnboardedUser);


//----------------
//Tutor

bookingRouter.get(
  "/availability",
  authMiddleware.requireTutorRole,
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
  validate(createAvailabilityValidator),
  bookingController.createAvailability
);
bookingRouter.patch(
  "/availability/:availabilityId",
  authMiddleware.requireTutorRole,
  validate(updateAvailabilityValidator),
  bookingController.updateAvailability
);
bookingRouter.patch(
  "/availability/:availabilityId/cancel",
  authMiddleware.requireTutorRole,
  validate(cancelBookingAvailabilityValidator),
  bookingController.updateAvailability
);
bookingRouter.delete(
  "/availability/:availabilityId",
  authMiddleware.requireTutorRole,
  validate(cancelBookingAvailabilityValidator),
  bookingController.deleteAvailability
);



//----------------
//Student
bookingRouter.get(
  "/",
  authMiddleware.requireStudentRole,
  bookingController.fetchStudentBookings
);
bookingRouter.get(
  "/:bookingId",
  authMiddleware.requireStudentRole,
  bookingController.fetchStudentBookingsById
);
bookingRouter.post(
  "/:bookingId",
  authMiddleware.requireStudentRole,
  bookingController.createBooking
);
bookingRouter.patch(
  "/:bookingId",
  authMiddleware.requireStudentRole,
  bookingController.updateBooking
);
//reject/cancel/reschedule
bookingRouter.patch(
  "/:bookingId/cancel",
  authMiddleware.requireStudentRole,
  bookingController.cancelBooking
);



module.exports = bookingRouter;
