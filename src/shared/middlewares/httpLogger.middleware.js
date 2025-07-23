const morgan = require("morgan");
const logger = require("../utils/logger");

const httpLogger = morgan((tokens, req, res) => {
  try {
    const logData = {
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      contentLength: tokens.res(req, res, "content-length"),
      responseTime: Number(tokens["response-time"](req, res)),
    };

    const level =
      logData.status >= 500 ? "error" : logData.status >= 400 ? "warn" : "info";

    logger[level]("HTTP Access Log", logData);
  } catch (error) {
    logger.error("Failed to parse morgan log", { error: error.message });
  }

  // return null so morgan doesn't write to the console
  // return null;
});

module.exports = httpLogger;
