const Joi = require("joi");

const uuid = Joi.string().guid({ version: ["uuidv4", "uuidv5"] });

// --- CREATE ---
exports.createReview = Joi.object({
  revieweeId: uuid.required().label("revieweeId").messages({
    "string.guid": "Reviewee ID must be a valid UUID",
    "any.required": "Reviewee ID is required",
  }),
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .label("rating")
    .messages({
      "number.min": "Rating must be at least 1",
      "number.max": "Rating must be no more than 5",
      "number.integer": "Rating must be a whole number",
      "any.required": "Rating is required",
    }),
  comment: Joi.string().allow(null, "").optional().label("comment").messages({
    "string.base": "Comment must be a string",
  }),
  type: Joi.string()
    .valid("tutor_to_student", "student_to_tutor", "session_feedback")
    .required()
    .label("type")
    .messages({
      "any.only":
        "Type must be one of [tutor_to_student, student_to_tutor, session_feedback]",
      "any.required": "Review type is required",
    }),
  sessionId: uuid.optional().label("sessionId").messages({
    "string.guid": "Session ID must be a valid UUID",
  }),
}).messages({
  "object.unknown": 'Unknown field "{{#label}}" is not allowed',
});

// --- READ ---
exports.getReviewsBySession = Joi.object({
  sessionId: uuid.required().label("sessionId").messages({
    "string.guid": "Session ID must be a valid UUID",
    "any.required": "Session ID is required",
  }),
});

exports.getReviewsForTutor = Joi.object({
  tutorId: uuid.required().label("tutorId").messages({
    "string.guid": "Tutor ID must be a valid UUID",
    "any.required": "Tutor ID is required",
  }),
});

exports.getReviewsForStudent = Joi.object({
  studentId: uuid.required().label("studentId").messages({
    "string.guid": "Student ID must be a valid UUID",
    "any.required": "Student ID is required",
  }),
});

exports.getReviewsByUser = Joi.object({
  userId: uuid.required().label("userId").messages({
    "string.guid": "User ID must be a valid UUID",
    "any.required": "User ID is required",
  }),
});

exports.getReviewAggregates = Joi.object({
  userId: uuid.required().label("userId").messages({
    "string.guid": "User ID must be a valid UUID",
    "any.required": "User ID is required",
  }),
});

// --- UPDATE ---
exports.updateReviewParams = Joi.object({
  reviewId: uuid.required().label("reviewId").messages({
    "string.guid": "Review ID must be a valid UUID",
    "any.required": "Review ID is required",
  }),
});

exports.updateReviewBody = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional()
    .label("rating")
    .messages({
      "number.min": "Rating must be at least 1",
      "number.max": "Rating must be no more than 5",
      "number.integer": "Rating must be a whole number",
    }),
  comment: Joi.string().allow(null, "").optional().label("comment").messages({
    "string.base": "Comment must be a string",
  }),
}).messages({
  "object.unknown": 'Unknown field "{{#label}}" is not allowed',
});

// --- DELETE ---
exports.deleteReview = Joi.object({
  reviewId: uuid.required().label("reviewId").messages({
    "string.guid": "Review ID must be a valid UUID",
    "any.required": "Review ID is required",
  }),
});
