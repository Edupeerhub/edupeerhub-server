const Joi = require("joi");

const allowedTimezones = [
  "UTC",
  "UTC+1",
  "UTC-1",
  "UTC+2",
  "UTC-2",
  "UTC+3",
  "UTC-3",
  "UTC+4",
  "UTC-4",
  "UTC+5",
  "UTC-5",
  "UTC+6",
  "UTC-6",
  "UTC+7",
  "UTC-7",
  "UTC+8",
  "UTC-8",
  "UTC+9",
  "UTC-9",
  "UTC+10",
  "UTC-10",
  "UTC+11",
  "UTC-11",
  "UTC+12",
  "UTC-12",
  "WAT",
  "EAT",
  "CAT",
  "EST",
  "PST",
  "CST",
];

const timezoneSchema = Joi.string()
  .trim()
  .custom((value, helpers) => {
    // Remove ALL spaces (leading, trailing, and internal)
    const cleaned = value.replace(/\s+/g, "");

    // Check if the cleaned value matches any allowed timezone (case-insensitive)
    const isValid = allowedTimezones.some(
      (tz) => tz.toLowerCase() === cleaned.toLowerCase()
    );

    if (!isValid) {
      return helpers.error("any.only");
    }

    return cleaned;
  })
  .optional()
  .allow("")
  .messages({
    "any.only":
      "Timezone must be a valid format (e.g. UTC, UTC+1, WAT, EST, PST)",
    "string.base": "Timezone must be a text value",
  });

const sendResponse = require("@utils/sendResponse");
//availability validator

exports.availabilityValidator = async (req, res, next) => {
  next();
};

//tutor profile validator
exports.createProfileSchema = Joi.object({
  bio: Joi.string().max(1000),
  timezone: timezoneSchema,
  education: Joi.string().max(255).required(),
  subjects: Joi.array().items(Joi.number()).min(1).required().label("subjects"),
});

exports.updateProfileSchema = Joi.object({
  bio: Joi.string().max(1000).optional().allow(""),
  education: Joi.string().max(255).optional().allow(""),
  profileVisibility: Joi.valid("active", "hidden"),
  timezone: timezoneSchema,
  subjects: Joi.array().items(Joi.number()).label("subjects"),
});

exports.canEditProfileValidator = async (req, res, next) => {
  const userId = req.user.id;
  const profileId = req.params.id;
  //own profile

  if (userId === profileId) {
    next();
    return;
  }

  //admin role
  if (req.user.role === "admin" || req.user.role === "superadmin") {
    next();
    return;
  }

  sendResponse(res, 403, "Access denied - cannot modify resource");
};

exports.searchValidator = Joi.object({
  page: Joi.number().default(1),
  limit: Joi.number().default(10),
  name: Joi.string(),
  subjects: Joi.string().pattern(/^[0-9,]+$/),
  ratings: Joi.string().pattern(/^[0-5,]+$/),
});

//tutor schedule search validator
exports.scheduleSearchValidator = async (req, res, next) => {
  next();
};
