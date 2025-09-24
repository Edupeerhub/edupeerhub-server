const Joi = require("joi");
const validate = require("@src/shared/middlewares/validate.middleware");
const uuid = Joi.string().guid({ version: ["uuidv4", "uuidv5"] });

module.exports = (labels) => {
  const normalizedLabels = Array.isArray(labels) ? labels : [labels];
  const schema = {};
  normalizedLabels.forEach((label) => {
    schema[label] = uuid.required().label(label);
  });
  return validate(Joi.object(schema), "params");
};
