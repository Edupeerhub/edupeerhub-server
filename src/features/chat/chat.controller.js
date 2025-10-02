const {
  sendUnreadMessageEmail,
} = require("@src/shared/email/email.service.js");
const { generateStreamToken } = require("../../shared/config/stream.config.js");
const ApiError = require("../../shared/utils/apiError");
const sendResponse = require("../../shared/utils/sendResponse");
const logger = require("@src/shared/utils/logger.js");

exports.handleStreamWebhook = async (req, res, next) => {
  try {
    const event = req.body;
    if (event.type !== "user.unread_message_reminder") {
      return sendResponse(res, 200, "Event ignored");
    }

    logger.info("unread message reminder event received", event.type);

    const { email, name: userName } = event.user;

    const channel = Object.values(event.channels)[0];

    const unreadCount = channel?.messages?.length || 0;

    const senderName =
      channel?.messages
        .map((msg) => msg.user?.name)
        .find((name) => name !== userName) || "";

    if (!email) {
      throw new ApiError("User email not found in Stream webhook payload", 400);
    }

    await sendUnreadMessageEmail(email, userName, unreadCount, senderName);

    sendResponse(res, 200, "Unread message email sent");
  } catch (error) {
    next(error);
  }
};

exports.getStreamToken = async (req, res, next) => {
  try {
    const token = generateStreamToken(req.user.id);

    sendResponse(res, 200, "", { token: token });
  } catch (error) {
    next(error);
  }
};
