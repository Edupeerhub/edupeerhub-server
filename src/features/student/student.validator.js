const Joi = require("joi");
const uuid = Joi.string().guid({ version: ["uuidv4", "uuidv5"] });

exports.getStudentById = {
  params: Joi.object({
    id: uuid.required().label("id"),
  }),
};

exports.createStudent = {
  body: Joi.object({
    gradeLevel: Joi.string().required().label("gradeLevel"),
    learningGoals: Joi.alternatives()
      .try(Joi.array().items(Joi.string()), Joi.string())
      .required()
      .label("learningGoals"),
    subjects: Joi.array().items(uuid).default([]).label("subjects"),
    exams: Joi.array().items(uuid).default([]).label("exams"),
  }),
};

exports.updateStudent = {
  params: Joi.object({ id: uuid.required().label("id") }),
  body: Joi.object({
    gradeLevel: Joi.string(),
    learningGoals: Joi.alternatives()
      .try(Joi.array().items(Joi.string()), Joi.string())
      .label("learningGoals"),
    subjects: Joi.array().items(uuid).label("subjects"),
    exams: Joi.array().items(uuid).label("exams"),
    accountStatus: Joi.string().valid('active', 'inactive').messages({
    'any.only': 'accountStatus must be one of [active, inactive]'
    })
  }),
};
