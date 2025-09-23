const Joi = require("joi");
const uuid = Joi.string().guid({ version: ["uuidv4", "uuidv5"] });

exports.getStudentById = {
  params: Joi.object({
    id: uuid.required().label("id"),
  }),
};

exports.createStudent = {
  body: Joi.object({
    learningGoals: Joi.array().items(Joi.string().required()).min(1).required(),
    subjects: Joi.array().items(Joi.number()).min(1).required(),
    exams: Joi.array().items(Joi.number()).min(1).required(),
  }),
};

exports.updateStudent = {
  params: Joi.object({ id: uuid.required().label("id") }),
  body: Joi.object({
    gradeLevel: Joi.string(),
    learningGoals: Joi.array().items(Joi.string()),
    subjects: Joi.array().items(Joi.number()).label("subjects"),
    exams: Joi.array().items(Joi.number()),
    accountStatus: Joi.string().valid("active", "inactive").messages({
      "any.only": "accountStatus must be one of [active, inactive]",
    }),
  }),
};
