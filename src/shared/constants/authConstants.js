// Verification code settings
const VERIFICATION_CODE_EXPIRY = 60 * 60 * 1000; // 1 hour
const RESET_LINK_EXPIRY = 15 * 60 * 1000; // 15 minutes
const MIN_RESEND_INTERVAL_MS = 30 * 1000; // 30 seconds
const VERIFICATION_CODE_LENGTH = 6;

// Password hashing
const SALT_ROUNDS = 10;

module.exports = {
  VERIFICATION_CODE_EXPIRY,
  MIN_RESEND_INTERVAL_MS,
  VERIFICATION_CODE_LENGTH,
  SALT_ROUNDS,
  RESET_LINK_EXPIRY,
};
