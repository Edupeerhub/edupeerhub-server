class ApiError extends Error {
  constructor(
    message,
    statusCode = 500,
    errorDetails = null,
    originalError = null
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = errorDetails;

    if (originalError && originalError.stack) {
      this.stack = originalError.stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
