const { EventLog } = require("../../shared/database");
const ApiError = require("../../shared/utils/apiError");

/**
 * Logs an analytic event to the database.
 * @param {string} eventType - The type of event (e.g. "user_signup").
 * @param {object} details - Additional metadata or context for the event.
 */
async function trackEvent(eventType, details) {
  try {
    await EventLog.create({
      eventType,
      details,
    });
  } catch (err) {
    throw new ApiError("Failed to track event", 500, err);
  }
}

module.exports = trackEvent;
