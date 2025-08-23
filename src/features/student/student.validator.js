const Joi = require('joi');

// Validator schema for getting student by ID
const getStudentById = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'Student ID must be a valid UUID'
  })
});

// Validator schema for creating a student
const createStudent = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'string.uuid': 'User ID must be a valid UUID'
  }),
  learningGoals: Joi.string().allow('', null),
  subjectIds: Joi.array().items(Joi.string().uuid()).default([]),
  examIds: Joi.array().items(Joi.string().uuid()).default([])
});

// Validator schema for updating a student
const updateStudent = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'Student ID must be a valid UUID'
  }),
  learningGoals: Joi.string().allow('', null),
  subjectIds: Joi.array().items(Joi.string().uuid()).default([]),
  examIds: Joi.array().items(Joi.string().uuid()).default([])
});

// Validator schema for onboarding
const completeOnboarding = Joi.object({
  learningGoals: Joi.string().required().min(10),
  subjectIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
  examIds: Joi.array().items(Joi.string().uuid()).min(1).required()
});

module.exports = {
  getStudentById,
  createStudent,
  updateStudent,
  completeOnboarding
};