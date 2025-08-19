const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");
const {
  ValidationError,
  UniqueConstraintError,
  DatabaseError,
} = require("sequelize");

const isProduction = process.env.NODE_ENV === "production";

const errorHandler = (error, req, res, next) => {
  let status = error.statusCode || 500;

  // ─── Error Normalization ─────────────────────────────

  // Sequelize unique constraint error (e.g., duplicate email)
  if (error instanceof UniqueConstraintError) {
    const field = error.errors[0].path;
    const value = error.errors[0].value;
    const message = `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } '${value}' already exists`;
    error = new ApiError("Duplicate resource", 409, message);
  }

  // Sequelize validation errors (e.g., notNull, len, isEmail, etc.)
  if (error instanceof ValidationError) {
    const messages = error.errors.map((err) => err.message);
    error = new ApiError("Validation error", 400, messages);
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

  status = error.statusCode;

  // ─── Skip 4xx Logs in Production ─────────────────────

  if (!isProduction || status >= 500) {
    const baseLog = {
      message: error.message,
      status,
      details: error.details,
      path: req.originalUrl,
      method: req.method,
    };

    if (isProduction) {
      logger.error("Error occurred", {
        ...baseLog,
        stack: error.stack,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        user: req.user ? { id: req.user.id, email: req.user.email } : undefined,
      });
    } else {
      logger.error("Error occurred", baseLog);
    }
  }

  // ─── Client Response ──────────────────────────────────
  if (status === 429 && error.details?.retryAfter) {
    return res.status(status).json({
      success: false,
      message: error.message,
      retryAfter: error.details.retryAfter,
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    error: error.details ?? null,
  });
};

module.exports = errorHandler;
