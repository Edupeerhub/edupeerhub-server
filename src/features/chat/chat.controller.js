const { generateStreamToken } = require("../../shared/config/stream.config.js");
const ApiError = require("../../shared/utils/apiError");
const sendResponse = require("../../shared/utils/sendResponse");
const {
  sendUnreadMessageEmail,
} = require("../../shared/email/emailTemplates.js");

/**
expose your local server to the internet:

npx ngrok http 3000
This will give you something like:
https://abc123.ngrok-free.app
Then in the Stream dashboard, set the webhook URL to:

https://abc123.ngrok-free.app/api/chat/webhook
Leave ngrok running so the webhook can reach your local dev environment.
 */
exports.handleStreamWebhook = async (req, res, next) => {
  try {
    const event = req.body;
    const { message, user: sender, type, members } = req.body;

    if (event.type === "message.new") {
      members
        .filter((member) => member.user_id !== sender.id)
        .forEach(({ user }) => {
          if (!user.online) {
            const { email, name: userName } = user;
            const unreadCount = user.unread_count;
            const senderName = message.user.name;
            // const message = `You have a new message from ${message.user.name} - ${message.text}`;
            // await sendUnreadMessageEmail(email, userName, unreadCount, senderName);
            console.log(email, userName, unreadCount, senderName);
          }
        });
    }

    // Only act on unread message reminder events
    // if (event.type !== "user.unread_message_reminder") {
    //   return sendResponse(res, 200, "Event ignored");
    // }

    // console.log("Received Stream webhook event:", event);

    // const { email, name: userName } = event.user;
    // const unreadCount = event.user.unread_count;
    // const senderNames = event.channels
    //   ? Object.values(event.channels)
    //       .flatMap((channel) => channel.messages.map((msg) => msg.user?.name))
    //       .filter(Boolean)
    //       .join(", ")
    //   : "";

    // if (!email) {
    //   throw new ApiError("User email not found in Stream webhook payload", 400);
    // }

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
