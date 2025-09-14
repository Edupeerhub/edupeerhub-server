const Joi = require("joi");

const createAvailabilityValidator = Joi.object({
  subjectId: Joi.number().required(),
  scheduledStart: Joi.date().required(),
  scheduledEnd: Joi.date().required(),
  tutorNotes: Joi.string(),
});

const updateAvailabilityValidator = Joi.object({
  subjectId: Joi.number().required(),
  scheduledStart: Joi.date().required(),
  scheduledEnd: Joi.date().required(),
  status: Joi.string().valid("pending", "confirmed", "completed", "cancelled"),
  tutorNotes: Joi.string(),
});

const cancelBookingAvailabilityValidator = Joi.object({
  cancellationReason: Joi.string().required(),
});

module.exports = {
  createAvailabilityValidator,
  updateAvailabilityValidator,
  cancelBookingAvailabilityValidator,
};
