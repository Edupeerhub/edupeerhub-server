const Joi = require("joi");

const sendResponse = require("@utils/sendResponse");
//availability validator

exports.availabilityValidator = async (req, res, next) => {
  next();
};

//tutor profile validator
exports.createProfileSchema = Joi.object({
  bio: Joi.string().max(1000),
  timezone: Joi.string().pattern(/^UTC(?:[+-][0-9]{1,2})?$/),
  education: Joi.string().max(255).required(),
  subjects: Joi.array().items(Joi.number()).min(1).required().label("subjects"),
});

exports.updateProfileSchema = Joi.object({
  bio: Joi.string().max(1000),
  education: Joi.string().max(255),
  profileVisibility: Joi.valid("active", "hidden"),

  timezone: Joi.string().pattern(/^UTC(?:[+-][0-9]{1,2})?$/),

  subjects: Joi.array().items(Joi.number()).min(1).required().label("subjects"),
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
  subjects: Joi.array().items(Joi.string()),  
  ratings: Joi.array().items(Joi.number()),
});

//tutor schedule search validator
exports.scheduleSearchValidator = async (req, res, next) => {
  next();
};
