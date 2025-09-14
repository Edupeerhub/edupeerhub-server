const sendResponse = require("@utils/sendResponse");
const {
  validateBookingData,
  validateAvailabilityData,
} = require("./booking.validator");

const bookingService = require("./booking.service");

const {
  createBooking,
  fetchStudentBookings,
  fetchStudentBookingsById,
  updateBooking,
  cancelBooking,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} = bookingService;

const ApiError = require("@src/shared/utils/apiError");

exports.createBooking = async (req, res, next) => {
  try {
    const booking = await createBooking(req.user.id, req.params.bookingId);
    sendResponse(res, 201, "Booking created successfully", booking);
  } catch (error) {
    next(error);
  }
};

exports.fetchStudentBookings = async (req, res, next) => {
  try {
    const bookings = await fetchStudentBookings(req.user.id);
    sendResponse(res, 200, "Bookings retrieved successfully", bookings);
  } catch (error) {
    next(error);
  }
};

exports.fetchStudentBookingsById = async (req, res, next) => {
  try {
    const booking = await fetchStudentBookingsById(
      req.params.bookingId,
      req.user.id
    );
    if (!booking) {
      throw new ApiError("Booking not found", 404);
    }
    sendResponse(res, 200, "Booking retrieved successfully", booking);
  } catch (error) {
    next(error);
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    const validatedData = validateBookingData(req.body);
    if (validatedData.error) {
      return next(new ApiError(validatedData.error.details[0].message, 400));
    }
    const booking = await updateBooking(
      req.params.bookingId,
      req.user.id,
      validatedData.value
    );
    if (!booking) {
      throw new ApiError("Booking not found", 404);
    }
    sendResponse(res, 200, "Booking updated successfully", booking);
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    await cancelBooking(req.params.bookingId, req.user.id);
    sendResponse(res, 200, "Booking cancelled successfully");
  } catch (error) {
    next(error);
  }
};

exports.createAvailability = async (req, res, next) => {
  try {
    const availability = await createAvailability(req.user.id, req.body);
    sendResponse(res, 201, "Availability created successfully", availability);
  } catch (error) {
    next(error);
  }
};

exports.fetchTutorAvailabilities = async (req, res, next) => {
  try {
    const bookings = await fetchStudentBookings(req.user.id);
    sendResponse(res, 200, "Bookings retrieved successfully", bookings);
  } catch (error) {
    next(error);
  }
};

exports.fetchTutorAvailability = async (req, res, next) => {
  try {
    const bookings = await fetchStudentBookings(req.user.id);
    sendResponse(res, 200, "Bookings retrieved successfully", bookings);
  } catch (error) {
    next(error);
  }
};

exports.updateAvailability = async (req, res, next) => {
  try {
    const validatedData = validateAvailabilityData(req.body);
    if (validatedData.error) {
      return next(new ApiError(validatedData.error.details[0].message, 400));
    }
    const availability = await updateAvailability(
      req.params.availabilityId,
      req.user.id,
      validatedData.value
    );
    if (!availability) {
      throw new ApiError("Availability not found", 404);
    }
    sendResponse(res, 200, "Availability updated successfully", availability);
  } catch (error) {
    next(error);
  }
};

exports.deleteAvailability = async (req, res, next) => {
  try {
    const availabilityId = req.params.availabilityId;
    await deleteAvailability(availabilityId, req.user.id);
    sendResponse(res, 200, "Availability deleted successfully");
  } catch (error) {
    next(error);
  }
};
