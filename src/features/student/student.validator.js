const Joi = require("joi");
const uuid = Joi.string().guid({ version: ["uuidv4", "uuidv5"] });

exports.getStudentById = {
  params: Joi.object({
    id: uuid.required().label("id"),
  }),
};

exports.createStudent = {
  body: Joi.object({
    gradeLevel: Joi.string().required(),
    learningGoals: Joi.array()
      .items(
        // Just incase we wanna send string or object instead of array
        Joi.alternatives().try(
          Joi.string().required(),
          Joi.object({ title: Joi.string().required() })
        )
      )
      .min(1)
      .required(),
    subjects: Joi.array().items(Joi.number()).min(1).required(),
    exams: Joi.array().items(Joi.number()).min(1).required(),
  }),
};

exports.updateStudent = {
  params: Joi.object({ id: uuid.required().label("id") }),
  body: Joi.object({
    gradeLevel: Joi.string(),
    learningGoals: Joi.alternatives()
      .try(Joi.array().items(Joi.string()), Joi.string())
      .label("learningGoals"),
    // subjects: Joi.array().items(uuid).label("subjects"),
    subjects: Joi.array().items(Joi.number()).min(1).required().label("subjects"),

    exams: Joi.array().items(uuid).label("exams"),
    accountStatus: Joi.string().valid("active", "inactive").messages({
      "any.only": "accountStatus must be one of [active, inactive]",
    }),
  }),
};
