const { default: axios } = require("axios");
const logger = require("./logger");

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

module.exports = async function sendSlackNotification(eventType, payload = {}) {
  if (!SLACK_WEBHOOK_URL) {
    logger.error(
      "❌ Missing SLACK_WEBHOOK_URL environment variable. Cannot send Slack notification."
    );
    return;
  }

  if (process.env.NODE_ENV === "test") {
    logger.info(
      `⚠️ Test environment detected. Slack notification for "${eventType}" not sent.`
    );
    return;
  }

  let blocks = [];

  switch (eventType) {
    case "signup":
      blocks = [
        {
          type: "header",
          text: { type: "plain_text", text: "🎉 New User Signup", emoji: true },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*👤 Name:*\n${payload.name}` },
            { type: "mrkdwn", text: `*📧 Email:*\n${payload.email}` },
            // {
            //   type: "mrkdwn",
            //   text: `*🎓 Role:*\n${payload.role || "Student"}`,
            // },
          ],
        },
      ];
      break;

    case "tutor_onboarded":
      blocks = [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "New Tutor Onboarded",
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Name:* ${payload.name}\n*Email:* ${payload.email}`,
            },
            // { type: "mrkdwn", text: `*Email:*\n${payload.email}` },
          ],
        },
      ];
      break;

    case "session_booked":
      blocks = [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "📅 New Session Booked",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*👩‍🎓 Student:*\n${payload.student}` },
            { type: "mrkdwn", text: `*🧑‍🏫 Tutor:*\n${payload.tutor}` },
            { type: "mrkdwn", text: `*📘 Subject:*\n${payload.subject}` },
            { type: "mrkdwn", text: `*🕒 Time:*\n${payload.time}` },
          ],
        },
      ];
      break;

    case "session_confirmed":
      blocks = [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "✅ Session Confirmed",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*👩‍🎓 Student:*\n${payload.student}` },
            { type: "mrkdwn", text: `*🧑‍🏫 Tutor:*\n${payload.tutor}` },
            { type: "mrkdwn", text: `*📘 Subject:*\n${payload.subject}` },
            { type: "mrkdwn", text: `*🗓 Date:*\n${payload.date}` },
          ],
        },
      ];
      break;

    default:
      blocks = [
        {
          type: "section",
          text: { type: "mrkdwn", text: `Unhandled event type: ${eventType}` },
        },
      ];
  }

  // 🕒 Add timestamp + divider
  blocks.push(
    { type: "divider" },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `🕒 *Triggered:* ${new Date().toLocaleString()}`,
        },
      ],
    }
  );

  try {
    await axios.post(SLACK_WEBHOOK_URL, { blocks });
    logger.info(`✅ Slack notification sent for: ${eventType}`);
  } catch (error) {
    logger.error(`❌ Slack notification failed (${eventType}):`, error.message);
  }
};
