const Joi = require('joi');

// Validator for getting student by ID
const getStudentById = {
  params: {
    id: Joi.string().uuid().required().messages({
      'string.uuid': 'Student ID must be a valid UUID'
    })
  }
};

// Validator for creating a student
const createStudent = {
  body: {
    userId: Joi.string().uuid().required().messages({
      'string.uuid': 'User ID must be a valid UUID'
    }),
    learningGoals: Joi.string().allow('', null),
    subjectIds: Joi.array().items(Joi.string().uuid()).default([]),
    examIds: Joi.array().items(Joi.string().uuid()).default([])
  }
};

// Validator for updating a student
const updateStudent = {
  params: {
    id: Joi.string().uuid().required().messages({
      'string.uuid': 'Student ID must be a valid UUID'
    })
  },
  body: {
    learningGoals: Joi.string().allow('', null),
    subjectIds: Joi.array().items(Joi.string().uuid()).default([]),
    examIds: Joi.array().items(Joi.string().uuid()).default([])
  }
};

// Validator for onboarding (you already have this)
const completeOnboarding = {
  body: {
    learningGoals: Joi.string().required().min(10),
    subjectIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
    examIds: Joi.array().items(Joi.string().uuid()).min(1).required()
  }
};

module.exports = {
  getStudentById,
  createStudent,
  updateStudent,
  completeOnboarding
};