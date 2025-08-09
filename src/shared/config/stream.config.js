const { StreamChat } = require("stream-chat");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  logger.error("Stream API key or secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

exports.upsertStreamUser = async (user) => {
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

exports.generateStreamToken = (userId) => {
  try {
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    throw new ApiError("Error generating Stream token", 502, {
      field: "stream",
      issue: error.message,
    });
  }
};
