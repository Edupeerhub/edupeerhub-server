const sendResponse = require("@utils/sendResponse");

const bookingService = require("./booking.service");

const ApiError = require("@src/shared/utils/apiError");
const trackEvent = require("@features/events/events.service");
const eventTypes = require("@features/events/eventTypes");
const commaStringToList = require("@src/shared/utils/commaStringToList");

exports.fetchUpcomingSession = async (req, res) => {
  const booking = await bookingService.fetchUpcomingSession(req.user);
  const message = booking
    ? "Upcoming session retrieved successfully"
    : "No upcoming session";
  sendResponse(res, 200, message, booking);
};
//--------------
//Student
exports.createBooking = async (req, res) => {
  const availability = await bookingService.fetchBookingById(
    req.params.bookingId
  );
  if (!availability) {
    throw new ApiError("Booking not found", 404);
  }

  if (availability.student !== null) {
    throw new ApiError("Booking is not available", 400);
  }

  if (availability.scheduledStart < new Date() + 2 * 60 * 60 * 1000) {
    throw new ApiError("Booking is not available", 400);
  }

  const booking = await bookingService.updateBooking(req.params.bookingId, {
    studentId: req.user.id,
    subjectId: req.body.subjectId,
    status: "pending",
  });
  sendResponse(res, 201, "Booking created successfully", booking);
};

exports.fetchStudentBookings = async (req, res) => {
  const bookings = await bookingService.fetchBookings({
    studentId: req.user.id,
    start: req.params?.start,
    end: req.params?.end,
    ...(req.params?.status && { status: commaStringToList(req.params.status) }),
  });

  sendResponse(res, 200, "Bookings retrieved successfully", bookings);
};

exports.fetchStudentTutorBookings = async (req, res) => {
  const start = req.query.start ? new Date(req.query.start) : new Date();
  const end = req.query.end ? new Date(req.query.end) : null;

  const bookings = await bookingService.fetchBookings({
    tutorId: req.params.tutorId,
    start,
    end,
    status: ["open"],
  });

  sendResponse(res, 200, "Bookings retrieved successfully", bookings);
};

exports.fetchStudentBookingById = async (req, res) => {
  const booking = await bookingService.fetchBookingById(req.params.bookingId);
  if (!booking) {
    throw new ApiError("Booking not found", 404);
  }

  if (booking.student.user.id !== req.user.id) {
    throw new ApiError("Unauthorized access to booking", 403);
  }

  sendResponse(res, 200, "Booking retrieved successfully", booking);
};

exports.updateBooking = async (req, res) => {
  const checkBooking = await bookingService.fetchBookingById(
    req.params.bookingId
  );

  if (!checkBooking) {
    throw new ApiError("Booking not found", 404);
  }
  if (checkBooking.tutor.user.id !== req.user.id) {
    throw new ApiError("Unauthorized access to booking", 403);
  }
  const booking = await bookingService.updateBooking(
    req.params.bookingId,
    req.body
  );

  sendResponse(res, 200, "Booking updated successfully", booking);
};

exports.cancelBooking = async (req, res) => {
  const checkBooking = await bookingService.fetchBookingById(
    req.params.bookingId
  );
  if (!checkBooking) {
    throw new ApiError("Booking not found", 404);
  }
  if (checkBooking.student.user.id !== req.user.id) {
    throw new ApiError("Unauthorized access to booking", 403);
  }
  const booking = await bookingService.updateBooking(req.params.bookingId, {
    cancelledBy: req.user.id,
    status: "cancelled",
    ...req.body,
  });
  trackEvent(eventTypes.SESSION_CANCELLED, {
    sessionId: booking.id,
    tutorId: booking.tutor?.user.id,
    studentId: booking.student?.user.id,
    cancelledBy: booking.cancelledBy,
    cancellationReason: booking.cancellationReason,
  });
  sendResponse(res, 200, "Booking cancelled successfully");
};

//--------------
//Tutor
exports.createAvailability = async (req, res) => {
  const availability = await bookingService.createBooking(
    req.user.id,
    req.body
  );
  sendResponse(res, 201, "Availability created successfully", availability);
};

exports.fetchTutorAvailabilities = async (req, res) => {
  const bookings = await bookingService.fetchBookings({
    tutorId: req.user.id,
    start: req.params?.start,
    end: req.params?.end,
    ...(req.query?.status && { status: commaStringToList(req.query.status) }),
  });
  sendResponse(res, 200, "Availabilities retrieved successfully", bookings);
};

exports.fetchTutorAvailability = async (req, res) => {
  const booking = await bookingService.fetchBookingById(
    req.params.availabilityId
  );

  if (!booking) {
    throw new ApiError("Availability not found", 404);
  }

  if (booking.tutor.user.id !== req.user.id) {
    throw new ApiError("Unauthorized access to availability", 403);
  }
  sendResponse(res, 200, "Availability retrieved successfully", booking);
};

exports.updateAvailability = async (req, res) => {
  const checkAvailability = await bookingService.fetchBookingById(
    req.params.availabilityId
  );
  if (!checkAvailability) {
    throw new ApiError("Availability not found", 404);
  }
  if (checkAvailability.tutor.user.id !== req.user.id) {
    throw new ApiError("Unauthorized access to availability", 403);
  }

  const availability = await bookingService.updateBooking(
    req.params.availabilityId,
    req.body
  );

  sendResponse(res, 200, "Availability updated successfully", availability);
};

exports.updateAvailabilityStatus = async (req, res) => {
  const checkAvailability = await bookingService.fetchBookingById(
    req.params.availabilityId
  );
  if (!checkAvailability) {
    throw new ApiError("Availability not found", 404);
  }
  if (checkAvailability.tutor.user.id !== req.user.id) {
    throw new ApiError("Unauthorized access to availability", 403);
  }

  const availability = await bookingService.updateBooking(
    req.params.availabilityId,
    req.body
  );

  if (availability.status === "confirmed") {
    trackEvent(eventTypes.SESSION_SCHEDULED, {
      sessionId: availability.id,
      tutorId: availability.tutor.user.id,
      subject: availability.subject,
      scheduledAt: new Date().toISOString(),
    });
  }

  sendResponse(
    res,
    200,
    "Availability status updated successfully",
    availability
  );
};

exports.cancelAvailability = async (req, res) => {
  const checkAvailability = await bookingService.fetchBookingById(
    req.params.availabilityId
  );
  if (!checkAvailability) {
    throw new ApiError("Availability not found", 404);
  }
  if (checkAvailability.tutor.user.id !== req.user.id) {
    throw new ApiError("Unauthorized access to availability", 403);
  }
  // if (!checkAvailability.student?.user) {
  //   throw new ApiError("Cannot cancel open availability", 400);
  // }

  const updatedBody = {
    ...req.body,
    cancelledBy: req.user.id,
    status: "cancelled",
  };
  const availability = await bookingService.updateBooking(
    req.params.availabilityId,
    updatedBody
  );
  trackEvent(eventTypes.SESSION_CANCELLED, {
    sessionId: availability.id,
    tutorId: availability.tutor?.user?.id,
    studentId: availability.student?.user?.id,
    cancelledBy: availability.cancelledBy,
    cancellationReason: availability.cancellationReason,
  });
  sendResponse(res, 200, "Availability updated successfully", availability);
};
exports.deleteAvailability = async (req, res) => {
  const checkAvailability = await bookingService.fetchBookingById(
    req.params.availabilityId
  );
  if (!checkAvailability) {
    throw new ApiError("Availability not found", 404);
  }
  if (checkAvailability.tutor.user.id !== req.user.id) {
    throw new ApiError("Unauthorized access to availability", 403);
  }
  if (checkAvailability.status !== "open") {
    throw new ApiError("Forbidden - Cannot delete availability", 400);
  }

  await bookingService.deleteBooking(req.params.availabilityId);
  sendResponse(res, 200, "Availability deleted successfully");
};
