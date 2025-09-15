const { StreamChat } = require("stream-chat");
const ApiError = require("@utils/apiError");
const logger = require("@utils/logger");

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

// Disable Stream if keys are missing
const streamDisabled = !apiKey || !apiSecret;

let streamClient = null;

if (!streamDisabled) {
  streamClient = StreamChat.getInstance(apiKey, apiSecret);
  logger.info("Stream is enabled");
} else {
  logger.warn(
    "Stream API keys missing. Stream calls will be skipped (dev/test mode)"
  );
}

/**
 * Upsert a user in Stream, or return the user directly if Stream is disabled
 */
exports.upsertStreamUser = async (user) => {
  if (streamDisabled) {
    logger.info(`Skipping Stream upsert for user: ${user.id}`);
    return user; // No-op for dev/test
  }

  try {
    await streamClient.upsertUsers([user]);
    return user;
  } catch (error) {
    throw new ApiError("Failed to sync user with Stream", 502, {
      field: "stream",
      issue: error.message,
    });
  }
};

/**
 * Generate a Stream token, or return a dummy token if Stream is disabled
 */
exports.generateStreamToken = (userId) => {
  if (streamDisabled) {
    logger.info(`Skipping Stream token generation for user: ${userId}`);
    return "dummy-stream-token"; // No-op for dev/test
  }

  try {
    return streamClient.createToken(userId.toString());
  } catch (error) {
    throw new ApiError("Error generating Stream token", 502, {
      field: "stream",
      issue: error.message,
    });
  }
};
