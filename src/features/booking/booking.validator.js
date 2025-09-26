const ApiError = require("@src/shared/utils/apiError");
const Joi = require("joi");

exports.createAvailabilityValidator = Joi.object({
  scheduledStart: Joi.date().required(),
  scheduledEnd: Joi.date().required(),
  tutorNotes: Joi.string().optional().allow(""),
});

exports.updateAvailabilityValidator = Joi.object({
  scheduledStart: Joi.date().optional(),
  scheduledEnd: Joi.date().optional(),
  tutorNotes: Joi.string().optional().allow(""),
});

exports.updateAvailabilityStatusValidator = Joi.object({
  status: Joi.string().valid("confirmed", "open"),
});

exports.createBookingValidator = Joi.object({
  subjectId: Joi.number().required(),
});

exports.cancelBookingAvailabilityValidator = Joi.object({
  cancellationReason: Joi.string().required(),
});

exports.updateBookingValidator = Joi.object({
  studentNotes: Joi.string().optional().allow(""),
});

exports.dateMiddleware = (req, res, next) => {
  ["start", "end"].forEach((key) => {
    if (req.query[key]) {
      const num = Number(req.query[key]);
      const value = isNaN(num) ? req.query[key] : num;

      req.params[key] = new Date(value);
      if (isNaN(req.params[key].getTime())) {
        throw new ApiError(`Invalid ${key} date`, 400);
      }
    }
  });

  if (req.params.start > req.params.end) {
    throw new ApiError("Start date must be before end date", 400);
  }

  next();
};
