const logger = require("../utils/logger");
const { mailtrapClient, sender } = require("./mailtrap.config");

const sendEmail = async (options) => {
  const enabled = process.env.EMAIL_ENABLED === "true";

  if (!enabled) {
    logger.info("📧 Email sending disabled. Would have sent:", options);
    return;
  }

  return mailtrapClient.send({
    from: sender,
    ...options,
  });
};

// Safe wrapper for non-critical emails
const safeSendEmail = async (options) => {
  try {
    await sendEmail(options);
    return true;
  } catch (error) {
    logger.error("❌ Failed to send email", {
      error: error.message,
      category: options.category,
      to: options.to,
      subject: options.subject,
    });
    return false;
  }
};

module.exports = { sendEmail, safeSendEmail };
