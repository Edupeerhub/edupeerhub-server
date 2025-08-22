const Joi = require('joi');

const completeOnboarding = {
  body: {
    learningGoals: Joi.string().required().min(38), // max number of chars from the longest choice seen on the figma prototype
    subjectIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
    examIds: Joi.array().items(Joi.string().uuid()).min(1).required()
  }
};

module.exports = {
  completeOnboarding
};