const logger = require("../utils/logger");
const { mailtrapClient, sender } = require("./mailtrap.config");

const sendEmail = async (options) => {
  const enabled = process.env.EMAIL_ENABLED === "true";

  if (!enabled) {
    logger.info("Email sending disabled. Would have sent:", options);
    return;
  }

  return mailtrapClient.send({
    from: sender,
    ...options,
  });
};

module.exports = { sendEmail };
