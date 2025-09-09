class ApiError extends Error {
  constructor(message, statusCode = 500, errorDetails = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = errorDetails;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
