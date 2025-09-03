const Joi = require("joi");

// ─── Reusable Field Rules ─────────
const firstNameRule = Joi.string().trim().min(1).required().messages({
  "string.empty": "First Name cannot be empty",
  "string.min": "First Name cannot be empty",
  "any.required": "First Name is required",
});

const lastNameRule = Joi.string().trim().min(1).required().messages({
  "string.empty": "Last Name cannot be empty",
  "string.min": "Last Name cannot be empty",
  "any.required": "Last Name is required",
});

const emailRule = Joi.string().trim().email().required().messages({
  "string.email": "Please provide a valid email address",
  "any.required": "Email is required",
  "string.empty": "Email cannot be empty",
});

const passwordRule = Joi.string()
  .min(6)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).+$/)
  .required()
  .messages({
    "string.min": "Password must be at least 6 characters long",
    "string.pattern.base":
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    "any.required": "Password is required",
    "string.empty": "Password cannot be empty",
  });

const rejectionReasonRule = Joi.string().trim().min(1).required().messages({
  "string.empty": "Rejection reason cannot be empty",
  "any.required": "Rejection reason is required",
});

const roleRule = Joi.string().valid("tutor", "student").required().messages({
  "any.only": "Role must be either 'tutor' or 'student'",
  "any.required": "Role is required",
});

// ─── Admin Validation Schemas ─────────
const adminValidation = {
  createAdmin: Joi.object({
    firstName: firstNameRule,
    lastName: lastNameRule,
    email: emailRule,
    password: passwordRule,
    isSuperAdmin: Joi.boolean().optional(),
  }),

  rejectTutor: Joi.object({
    rejectionReason: rejectionReasonRule,
  }),

  changeUserRole: Joi.object({
    role: roleRule,
  }),
};

module.exports = adminValidation;
