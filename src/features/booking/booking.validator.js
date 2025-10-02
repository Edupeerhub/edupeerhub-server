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
  req.parsedDates = {};

  ["start", "end"].forEach((key) => {
    const raw = req.query[key];
    if (!raw) return;

    let date;
    if (/^\d+$/.test(raw)) {
      date = new Date(Number(raw));
    } else {
      date = new Date(raw);
    }

    if (isNaN(date.getTime())) {
      return next(new ApiError(`Invalid ${key} date`, 400));
    }

    req.parsedDates[key] = date;
  });

  if (
    req.parsedDates.start &&
    req.parsedDates.end &&
    req.parsedDates.start > req.parsedDates.end
  ) {
    return next(new ApiError("Start date must be before end date", 400));
  }

  next();
};
