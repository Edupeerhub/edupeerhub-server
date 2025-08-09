const { Op } = require("sequelize");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { upsertStreamUser } = require("../../shared/config/stream.config");
const ApiError = require("../../shared/utils/apiError");
const { User } = require("../../shared/database/index");

// ==========================
// Constants
// ==========================
const VERIFICATION_CODE_EXPIRY = 60 * 60 * 1000; // 1 hour
const MIN_RESEND_INTERVAL_MS = 30 * 1000; // 30 seconds
const VERIFICATION_CODE_LENGTH = 6;
const SALT_ROUNDS = 10;
// ==========================
// Helpers
// ==========================
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

function generateRandomAvatar(firstName, lastName) {
  return `https://avatar.iran.liara.run/username?username=${firstName}+${lastName}`;
}

function generateResetToken() {
  const token = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hashedToken };
}

function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// ==========================
// User Services
// ==========================
exports.createUser = async ({ firstName, lastName, email, password }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError(
      "Email already exists, please use a different one",
      409,
      [{ field: "email", message: "Email already exists", value: email }]
    );
  }

  const hashedPassword = await hashPassword(password);
  const randomAvatar = generateRandomAvatar(firstName, lastName);
  const { code, expiresAt } = generateVerificationCode();

  const newUser = await User.create({
    email,
    firstName: firstName,
    lastName: lastName,
    passwordHash: hashedPassword,
    profileImageUrl: randomAvatar,
    verificationToken: code,
    verificationTokenExpiresAt: expiresAt,
    isVerified: false,
    isOnboarded: false,
  });

  return newUser;
};

exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({
    where: { email },
    attributes: [
      "id",
      "email",
      "firstName",
      "lastName",
      "role",
      "accountStatus",
      "isDeleted",
      "passwordHash",
    ],
  });

  if (!user) throw new ApiError("Invalid email or password", 401);
  if (user.accountStatus === "suspended")
    throw new ApiError("Your account is suspended", 403);
  if (user.isDeleted) throw new ApiError("Account no longer exists", 403);

  const isMatch = await user.isValidPassword(password);
  if (!isMatch) throw new ApiError("Invalid email or password", 401);
  user.lastLogin = new Date();
  await user.save();

  return user;
};

exports.fetchProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: [
      "firstName",
      "lastName",
      "email",
      "profileImageUrl",
      "isOnboarded",
      "isVerified",
      "role",
    ],
  });

  if (!user) throw new ApiError("User not found", 404);

  return user;
};

exports.verifyUserEmail = async (code) => {
  const user = await User.findOne({
    where: {
      verificationToken: code,
      verificationTokenExpiresAt: { [Op.gt]: new Date() },
    },
    attributes: [
      "id",
      "isVerified",
      "verificationToken",
      "verificationTokenExpiresAt",
    ],
  });

  if (!user) throw new ApiError("Invalid or expired verification code", 400);

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiresAt = null;
  await user.save();

  return user;
};

exports.resendVerificationEmail = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: [
      "isVerified",
      "verificationToken",
      "verificationTokenExpiresAt",
      "email",
    ],
  });

  if (!user) throw new ApiError("User not found", 404);
  if (user.isVerified) throw new ApiError("User is already verified", 400);

  const nextAllowedTime =
    new Date(user.verificationTokenExpiresAt).getTime() -
    (VERIFICATION_CODE_EXPIRY - MIN_RESEND_INTERVAL_MS);

  if (Date.now() < nextAllowedTime) {
    throw new ApiError(
      "Please wait a few seconds before requesting another verification code.",
      429
    );
  }

  const { code, expiresAt } = generateVerificationCode();
  user.verificationToken = code;
  user.verificationTokenExpiresAt = expiresAt;

  await user.save();
  return user;
};

exports.forgotUserPassword = async (email) => {
  const user = await User.findOne({
    where: { email },
    attributes: ["id", "email", "resetPasswordToken", "resetPasswordExpiresAt"],
  });

  if (!user) return null;

  const { token, hashedToken } = generateResetToken();
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRY);

  await user.save();
  return { userEmail: user.email, resetToken: token };
};

exports.resetUserPassword = async (token, password) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: { [Op.gt]: new Date() },
    },
    attributes: [
      "id",
      "passwordHash",
      "resetPasswordToken",
      "resetPasswordExpiresAt",
    ],
  });

  if (!user) throw new ApiError("Invalid or expired reset token", 401);

  const hashedPassword = await hashPassword(password);

  user.passwordHash = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpiresAt = null;
  await user.save();

  return user.email;
};

exports.changeUserPassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findByPk(userId, {
    attributes: ["id", "passwordHash", "email"],
  });
  if (!user) throw new ApiError("User not found", 404);

  const isMatch = await user.isValidPassword(oldPassword);
  if (!isMatch) throw new ApiError("Current password is incorrect", 400);

  const hashedPassword = await hashPassword(newPassword);

  user.passwordHash = hashedPassword;
  await user.save();
  return { id: user.id, email: user.email };
};

// exports.onBoardUser = async (userData) => {
//   const { userId, ...updates } = userData;

//   const [updatedCount, [updatedUser]] = await User.update(
//     { ...updates, isOnboarded: true },
//     { where: { id: userId }, returning: true }
//   );

//   if (!updatedCount) throw new ApiError("User not found", 404);

//   return updatedUser;
// };

exports.addStreamUser = async ({
  id,
  firstName,
  lastName,
  profileImageUrl,
  email,
}) => {
  await upsertStreamUser({
    id: id.toString(),
    name: `${firstName} ${lastName}`.trim(),
    image: profileImageUrl || "",
    email: email,
  });
};
