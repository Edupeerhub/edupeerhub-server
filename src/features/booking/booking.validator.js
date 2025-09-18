const Joi = require("joi");

exports.createAvailabilityValidator = Joi.object({
  subjectId: Joi.number().required(),
  scheduledStart: Joi.date().required(),
  scheduledEnd: Joi.date().required(),
  tutorNotes: Joi.string(),
});

exports.updateAvailabilityValidator = Joi.object({
  subjectId: Joi.number().required(),
  scheduledStart: Joi.date().required(),
  scheduledEnd: Joi.date().required(),
  status: Joi.string().valid("confirmed"),
  tutorNotes: Joi.string(),
});

exports.cancelBookingAvailabilityValidator = Joi.object({
  cancellationReason: Joi.string().required(),
});

exports.updateBookingValidator = Joi.object({
  studentNotes: Joi.string(),
});
