const Joi = require("joi");

const uuid = Joi.string().guid({ version: ["uuidv4", "uuidv5"] });

exports.getStudentById = {
  params: Joi.object({ id: uuid.required() }),
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
  params: Joi.object({ id: uuid.required() }),
  body: Joi.object({
    gradeLevel: Joi.string().optional(),
    learningGoals: Joi.array().items(Joi.string().required()),
    subjects: Joi.array().items(uuid),
    exams: Joi.array().items(uuid),
    isOnboarded: Joi.boolean(),
  }),
};

exports.listStudents = {};
