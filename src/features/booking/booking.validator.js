const ApiError = require("@src/shared/utils/apiError");
const Joi = require("joi");

exports.createAvailabilityValidator = Joi.object({
  subjectId: Joi.number().required(),
  scheduledStart: Joi.date().required(),
  scheduledEnd: Joi.date().required(),
  tutorNotes: Joi.string(),
});

exports.updateAvailabilityValidator = Joi.object({
  subjectId: Joi.number(),
  scheduledStart: Joi.date(),
  scheduledEnd: Joi.date(),
  tutorNotes: Joi.string(),
  status: Joi.string().valid("confirmed", "open"),
});

exports.cancelBookingAvailabilityValidator = Joi.object({
  cancellationReason: Joi.string().required(),
});

exports.updateBookingValidator = Joi.object({
  studentNotes: Joi.string(),
});

exports.dateMiddleware = (req, res, next) => {
  if (req.query.date) {
    req.params.date = new Date(new Date(req.query.date).setHours(0, 0, 0, 0));
    if (isNaN(req.params.date.getTime())) {
      throw new ApiError("Invalid date", 400);
    }
  } else {
      req.params.date = new Date(new Date().setHours(0, 0, 0, 0));
    }

  next();
};
