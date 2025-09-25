const crypto = require("crypto");
const bcrypt = require("bcrypt");
const {
  VERIFICATION_CODE_EXPIRY,
  VERIFICATION_CODE_LENGTH,
  SALT_ROUNDS,
} = require("@src/shared/constants/authConstants");

// Generate a numeric verification code
function generateVerificationCode() {
  const code = Math.floor(
    10 ** (VERIFICATION_CODE_LENGTH - 1) +
      Math.random() * 9 * 10 ** (VERIFICATION_CODE_LENGTH - 1)
  ).toString();

  return {
    code,
    expiresAt: new Date(Date.now() + VERIFICATION_CODE_EXPIRY),
  };
}

// Generate avatar URL
function generateRandomAvatar(firstName, lastName) {
  // return `https://avatar.iran.liara.run/username?username=${firstName}+${lastName}`;
  return `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=4ca1f0&color=fff`;
}

// Generate reset token and hashed token
function generateResetToken() {
  const token = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hashedToken };
}

// Hash a password
function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

module.exports = {
  generateVerificationCode,
  generateRandomAvatar,
  generateResetToken,
  hashPassword,
};
