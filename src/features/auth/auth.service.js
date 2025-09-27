const { Op } = require("sequelize");
const crypto = require("crypto");
const { upsertStreamUser } = require("@src/shared/config/stream.config");
const ApiError = require("@utils/apiError");
const { User } = require("@models");
const {
  hashPassword,
  generateRandomAvatar,
  generateVerificationCode,
  generateResetToken,
} = require("@utils/authHelpers");
const {
  MIN_RESEND_INTERVAL_MS,
  VERIFICATION_CODE_EXPIRY,
} = require("@src/shared/constants/authConstants");

exports.createUser = async ({ firstName, lastName, email, password }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError(
      "Email already exists, please use a different one",
      409,
      [{ field: "email", message: "Email already exists", value: email }]
    );
  }

  const randomAvatar = generateRandomAvatar(firstName, lastName);
  const { code, expiresAt } = generateVerificationCode();

  const newUser = await User.create({
    email,
    firstName: firstName,
    lastName: lastName,
    passwordHash: password,
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
      "deletedAt",
      "passwordHash",
    ],
  });

  if (!user) throw new ApiError("Invalid email or password", 401);
  if (user.accountStatus === "suspended")
    throw new ApiError("Your account is suspended", 403);
  if (user.deletedAt) throw new ApiError("Account no longer exists", 403);

  const isMatch = await user.isValidPassword(password);
  if (!isMatch) throw new ApiError("Invalid email or password", 401);
  user.lastLogin = new Date();
  await user.save();

  return user;
};

exports.fetchProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: [
      "id",
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
      "email",
      "firstName",
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
      "id",
      "isVerified",
      "verificationToken",
      "verificationTokenExpiresAt",
      "email",
    ],
  });

  if (!user) throw new ApiError("User not found", 404);
  if (user?.isVerified) throw new ApiError("User is already verified", 400);

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
  await user.update({
    verificationToken: code,
    verificationTokenExpiresAt: expiresAt,
  });
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
      "email",
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

  user.passwordHash = newPassword;
  await user.save();
  return { id: user.id, email: user.email };
};

exports.addStreamUser = async ({
  id,
  firstName,
  lastName,
  profileImageUrl,
  email,
  role,
}) => {
  await upsertStreamUser({
    id: id.toString(),
    name: `${firstName} ${lastName}`.trim(),
    image: profileImageUrl || "",
    email: email,
    app_role: role,
  });
};
