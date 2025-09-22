// services/trackSessionEvent.js
const { EventLog } = require("@models");
const ApiError = require("@utils/apiError");

/**
 * Logs a session event with structured metadata.
 * @param {string} type - "session_started" | "session_completed"
 * @param {object} data - { sessionId, userId, tutorId, startedAt?, endedAt?, durationSecs? }
 */
async function trackSessionEvent(type, data) {
  try {
    await EventLog.create({
      eventType: type,
      details: data,
    });
  } catch (err) {
    throw new ApiError("Failed to track session event", 500, err);
  }
}

module.exports = trackSessionEvent;
