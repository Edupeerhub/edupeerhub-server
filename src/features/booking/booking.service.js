const { Tutor, Booking } = require("@models");
const ApiError = require("@src/shared/utils/apiError");
const { Op } = require("sequelize");

const createBooking = async (userId, bookingId) => {
  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    throw new ApiError("Booking not found", 404);
  }

  if (booking.studentId !== null) {
    throw new ApiError("Booking already assigned", 400);
  }

  await booking.update({ studentId: userId });
  return booking;
};

const fetchStudentBookings = async (userId) => {
  const bookings = await Booking.findAll({
    where: {
      studentId: userId,
    },
  });
  return bookings;
};

const fetchStudentBookingsById = async (userId, bookingId) => {
  const booking = await Booking.findByPk(bookingId, {
    where: {
      studentId: userId,
    },
  });
  if (!booking) {
    throw new ApiError("Booking not found",404);
  }
  return booking;
};

const updateBooking = async (userId, bookingId, updatedData) => {
  const booking = await Booking.findByPk(bookingId, {
    where: {
      tutorId: userId,
    },
  });
  if (!booking) {
    throw new ApiError("Booking not found",404);
  }
  await booking.update(updatedData);
  return booking;
};

const cancelBooking = async (userId, bookingId) => {
  const booking = await Booking.findByPk(bookingId, {
    where: {
      tutorId: userId,
    },
  });
  if (!booking) {
    throw new ApiError("Booking not found",404);
  }
  await booking.update({ status: "cancelled" });
  return booking;
};

const createAvailability = async (userId, availabilityData) => {
  const availability = await Booking.create({
    ...availabilityData,
    tutorId: userId,
  });
  return availability;
};

const updateAvailability = async (userId, availabilityId, updatedData) => {
  const availability = await Booking.update(availabilityId, {
    where: {
      tutorId: userId,
    },
  });
  if (!availability) {
    throw new ApiError("Availability not found", 404);
  }
  await availability.update(updatedData);
  return availability;
};

const deleteAvailability = async (userId, availabilityId) => {
  const availability = await Booking.destroy({
    where: {
        id: availabilityId,
      tutorId: userId,

    },
  });
  if (!availability) {
    throw new ApiError("Availability not found", 404);
  }
  await availability.destroy();
  return availability;
};

module.exports = {
  createBooking,
  fetchStudentBookings,
  fetchStudentBookingsById,
  updateBooking,
  cancelBooking,
  createAvailability,
  updateAvailability,
  deleteAvailability,
};
