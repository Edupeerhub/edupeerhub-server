const Joi = require("joi");

const sendResponse = require("@utils/sendResponse");
//availability validator

exports.availabilityValidator = async (req, res, next) => {
  next();
};

//tutor profile validator
exports.profileSchema = Joi.object({
  bio: Joi.string().max(1000).required(),
  education: Joi.string().max(255).required(),
  profileVisibility: Joi.valid().valid("active", "hidden"),

  timezone: Joi.string().pattern(
    /^UTC[+-][0.9]{0,2}?$/, {invert :true}
  ),
  subjectIds: Joi.array().items(Joi.string().uuid()).default([]),
  
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
//tutor search validator
exports.searchValidator = async (req, res, next) => {
  next();
};

//tutor schedule search validator
exports.scheduleSearchValidator = async (req, res, next) => {
  next();
};
