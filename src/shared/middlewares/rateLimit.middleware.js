const rateLimit = require("express-rate-limit");
const ApiError = require("../utils/apiError.util");
const logger = require("../utils/logger");

const loginRateLimiter = rateLimit({
  windowMs: 30 * 1000, // 30 seconds
  max: 4,
  handler: (req, res, next) => {
    logger.warn("Rate limit hit", {
      ip: req.ip,
      path: req.originalUrl,
      method: req.method,
      userAgent: req.get("User-Agent"),
    });

    const error = new ApiError(
      "Too many login attempts. Please try again later.",
      429
    );

    next(error);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = loginRateLimiter;
