const ApiError = require("../utils/apiError.util");

// Helper to prevent leaking sensitive values in validation errors
const shouldIncludeValue = (fieldName) => {
  const sensitiveFields = ["password", "confirmPassword", "token", "apiKey"];
  return !sensitiveFields.includes(fieldName);
};

const validate =
  (schema, property = "body") =>
  (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const formatted = error.details.map((d) => ({
        field: d.context.label,
        issue: d.message.replace(/"/g, ""),
        ...(shouldIncludeValue(d.context.label) && { value: d.context?.value }),
      }));
      return next(new ApiError("Validation error.", 400, formatted));
    }

    next();
  };

module.exports = validate;
