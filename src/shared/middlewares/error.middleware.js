const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");
const {
  ValidationError,
  UniqueConstraintError,
  DatabaseError,
} = require("sequelize");

const errorHandler = (error, req, res) => {
  // Log via Winston
  logger.error("Error occurred", {
    message: error.message,
    status: error.statusCode || 500,
    stack: error.stack,
    path: req.originalUrl,
    method: req.method,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    user:
      process.env.NODE_ENV === "production" && req.user
        ? { id: req.user.id, email: req.user.email }
        : undefined,
  });

  // Sequelize validation errors (e.g., notNull, len, isEmail, etc.)
  if (error instanceof ValidationError) {
    const messages = error.errors.map((err) => err.message);
    error = new ApiError("Validation error", 400, messages);
  }

  // Sequelize unique constraint error (e.g., duplicate email)
  if (error instanceof UniqueConstraintError) {
    const field = error.errors[0].path;
    const value = error.errors[0].value;
    const message = `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } '${value}' already exists`;
    error = new ApiError("Duplicate resource", 409, message);
  }

  // Sequelize general DB errors
  if (error instanceof DatabaseError) {
    error = new ApiError("Database error", 500, {
      dbMessage: error.message,
      original: error.parent?.detail || null,
    });
  }

  // Auto-wrap non-ApiError instances
  if (!(error instanceof ApiError)) {
    error = new ApiError("Internal server error", 500, {
      originalMessage: error.message,
      name: error.name,
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    error: error.details ?? null,
  });
};

module.exports = errorHandler;
