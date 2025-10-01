require("dotenv").config();
const logger = require("../utils/logger");
const { StreamChat } = require("stream-chat");

// Load API keys
const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

// Default reminder interval: 10 minutes (600 seconds)
const defaultReminderInterval = 600;

// Validate and parse environment override
let reminderInterval = parseInt(process.env.STREAM_REMINDERS_INTERVAL, 10);
if (isNaN(reminderInterval) || reminderInterval <= 0) {
  reminderInterval = defaultReminderInterval;
}

if (!apiKey || !apiSecret) {
  logger.error("Stream API key or secret is missing");
  process.exit(1);
}

const client = StreamChat.getInstance(apiKey, apiSecret);

// Function to enable reminders for the channel type
async function enableChannelReminders() {
  try {
    await client.updateChannelType("messaging", {
      reminders: true,
      read_events: true,
    });
    logger.info("Channel type reminders enabled successfully");
  } catch (error) {
    logger.error("Error enabling channel reminders:", error);
    process.exit(1);
  }
}

// Function to update app-wide reminder interval
async function updateAppReminderInterval() {
  try {
    await client.updateAppSettings({
      reminders_interval: reminderInterval, // in seconds
    });
    logger.info(`App reminder interval set to ${reminderInterval} seconds`);
  } catch (error) {
    logger.error("Error updating app reminder interval:", error);
    process.exit(1);
  }
}

// Main function
async function main() {
  logger.info("Starting reminder settings update...");
  await enableChannelReminders();
  await updateAppReminderInterval();
  logger.info("Update completed successfully.");
}

main();
