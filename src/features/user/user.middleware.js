const ApiError = require("@src/shared/utils/apiError");
const Joi = require("joi");

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  // Student specific fields
  //   student: Joi.object({
  //     bio: Joi.string().max(500).optional(),
  //     grade: Joi.string().optional(),
  //     school: Joi.string().optional(),
  //     subjects: Joi.array().items(Joi.string()).optional(),
  //   }).optional(),
  //   // Tutor specific fields
  //   tutor: Joi.object({
  //     bio: Joi.string().max(500).optional(),
  //     headline: Joi.string().max(100).optional(),
  //     experience: Joi.number().integer().min(0).optional(),
  //     education: Joi.string().optional(),
  //     hourlyRate: Joi.number().min(0).optional(),
  //     subjects: Joi.array().items(Joi.string()).optional(),
  //     availability: Joi.array().items(Joi.string()).optional(),
  //     // documentKey is handled by file upload, not directly in body
  //   }).optional(),
});

const checkUserOwnsProfile = (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(new ApiError("You're not allowed to perform this action", 403));
  }
  next();
};

module.exports = {
  updateProfileSchema,
  checkUserOwnsProfile,
};
