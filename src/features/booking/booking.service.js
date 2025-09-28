const { Tutor, Booking } = require("@models");
const ApiError = require("@src/shared/utils/apiError");
const { date } = require("joi");
const { Op } = require("sequelize");

exports.fetchBookings = async ({
  studentId,
  tutorId,
  start,
  end,
  status = ["open", "completed", "cancelled", "pending"],
}) => {
  const statusList = Array.isArray(status) ? status : [status];

  const query = {
    status: { [Op.in]: statusList },
    ...(studentId && { studentId }),
    ...(tutorId && { tutorId }),
    ...((start || end) && {
      [Op.and]: [
        ...(start ? [{ scheduledStart: { [Op.gte]: start } }] : []),
        ...(end ? [{ scheduledStart: { [Op.lte]: end } }] : []),
      ],
    }),
  };

  const bookings = await Booking.scope("join").findAll({
    where: query,
    order: [["scheduledStart", "ASC"]],
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
  if (updatedData.status === "open") {
    updatedData.studentId = null;
  }

  const booking = await Booking.update(updatedData, {
    where: {
      id: bookingId,
    },
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

  return this.fetchBookingById(availability.id);
};

exports.deleteBooking = async (bookingId) => {
  return await Booking.destroy({
    where: {
      id: bookingId,
    },
  });
};

exports.fetchUpcomingSession = async (user) => {
  const date = new Date();
  const query = {
    status: "confirmed",
    scheduledStart: {
      [Op.gte]: date,
    },
  };

  if (user.role === "tutor") {
    query.tutorId = user.id;
  } else {
    query.studentId = user.id;
  }
  const booking = await Booking.scope("join").findOne({
    where: query,
    order: [["scheduledStart", "ASC"]],
  });
  return booking;
};
