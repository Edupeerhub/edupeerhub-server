const { User } = require("@models");

const user = {
  firstName: "John",
  lastName: "Dupe",
  email: "john@example.com",
  password: "StrongPass123!",
};

const { v4: uuidv4 } = require("uuid");

exports.uuid = uuidv4;

exports.userObject = user;

exports.createVerifiedUser = async () =>
  await User.create({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    passwordHash: user.password,
    profileImageUrl: "randomAvatar",
    verificationToken: "123456",
    verificationTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    isVerified: true,
    isOnboarded: false,
  });
