const sendResponse = require("@utils/sendResponse");

const bookingService = require("./booking.service");


const ApiError = require("@src/shared/utils/apiError");

//--------------
//Student
exports.createBooking = async (req, res) => {
  const availability = await bookingService.fetchBookingById(
    req.params.availabilityId
  );
  if (!availability) {
    throw new ApiError("Booking not found", 404);
  }

  if (availability.studentId !== null) {
    throw new ApiError("Booking is not available", 400);
  }

  if (availability.scheduledStart < new Date() + 2 * 60 * 60 * 1000) {
    throw new ApiError("Booking is not available", 400);
  }

  const booking = await bookingService.updateBooking(req.params.bookingId, {
    studentId: req.user.id,
  });
  sendResponse(res, 201, "Booking created successfully", booking);
};

exports.fetchStudentBookings = async (req, res) => {
  const bookings = await bookingService.fetchBookings({
    studentId: req.user.id,
    date: req.params.date,
  });

  sendResponse(res, 200, "Bookings retrieved successfully", bookings);
};

exports.fetchStudentTutorBookings = async (req, res) => {
  const bookings = await bookingService.fetchBookings({
    tutorId: req.params.tutorId,
    date: req.params.date,
    statuses: ["open"],
  });

  sendResponse(res, 200, "Bookings retrieved successfully", bookings);
};

exports.fetchStudentBookingById = async (req, res) => {
  const booking = await bookingService.fetchBookingById(req.params.bookingId);
  if (!booking) {
    throw new ApiError("Booking not found", 404);
  }

  if (booking.studentId !== req.user.id) {
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
  if (checkBooking.tutorId !== req.user.id) {
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
  if (checkBooking.studentId !== req.user.id) {
    throw new ApiError("Unauthorized access to booking", 403);
  }
  await bookingService.cancelBooking(req.user.id, req.params.bookingId);
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
    date: req.params.date,
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

  if (booking.tutorId !== req.user.id) {
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
  if (checkAvailability.tutorId !== req.user.id) {
    throw new ApiError("Unauthorized access to availability", 403);
  }
  const availability = await bookingService.updateBooking(
    req.params.availabilityId,
    req.body
  );

  sendResponse(res, 200, "Availability updated successfully", availability);
};

exports.cancelAvailability = async (req, res) => {
  const checkAvailability = await bookingService.fetchBookingById(
    req.params.availabilityId
  );
  if (!checkAvailability) {
    throw new ApiError("Availability not found", 404);
  }
  if (checkAvailability.tutorId !== req.user.id) {
    throw new ApiError("Unauthorized access to availability", 403);
  }

  const updatedBody = {
    ...req.body,
    cancelledBy: req.user.id,
    status: "cancelled",
  };
  const availability = await bookingService.updateBooking(    
    req.params.availabilityId,
    updatedBody
  );
  
  sendResponse(res, 200, "Availability updated successfully", availability);
};
exports.deleteAvailability = async (req, res) => {
  const checkAvailability = await bookingService.fetchBookingById(
    req.params.availabilityId
  );
  if (!checkAvailability) {
    throw new ApiError("Availability not found", 404);
  }
  if (checkAvailability.tutorId !== req.user.id) {
    throw new ApiError("Unauthorized access to availability", 403);
  }
  if (checkAvailability.status !== "open") {
    throw new ApiError("Forbidden - Cannot cancel availability", 400);
  }

  await bookingService.deleteBooking(req.params.availabilityId);
  sendResponse(res, 200, "Availability deleted successfully");
};
