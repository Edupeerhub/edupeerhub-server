const { Tutor, Booking } = require("@models");
const ApiError = require("@src/shared/utils/apiError");
const { Op } = require("sequelize");

exports.fetchBookings = async ({
  studentId,
  tutorId,
  date,
  statuses = ["open", "completed", "cancelled", "pending"],
}) => {
  const query = {
    status: {
      [Op.in]: statuses,
    },
    scheduledStart: {
      [Op.between]: [new Date(date), new Date(date.setHours(23, 59, 59, 999))],
    },
  };
  if (studentId) {
    query.studentId = studentId;
  }
  if (tutorId) {
    query.tutorId = tutorId;
  }
  const bookings = await Booking.scope("join").findAll({
    where: query,
  });
  return bookings;
};

exports.fetchBookingById = async (bookingId) => {
  const booking = await Booking.scope("join").findByPk(bookingId);
  if (!booking) {
    throw new ApiError("Booking not found", 404);
  }
  return booking;
};

exports.updateBooking = async (bookingId, updatedData) => {
  const booking = await Booking.update(updatedData, {
    where: {
      id: bookingId,
    },
    returning: true,
    individualHooks: true,
  });

  if (booking[0] === 0) {
    throw new ApiError("Booking not updated", 500);
  }
  return await this.fetchBookingById(bookingId);
};

exports.createBooking = async (userId, availabilityData) => {
  const availability = await Booking.scope("join").create({
    ...availabilityData,
    tutorId: userId,
  });
  return availability;
};

exports.deleteBooking = async (bookingId) => {
  return await Booking.destroy({
    where: {
      id: bookingId,
    },
  });
};
