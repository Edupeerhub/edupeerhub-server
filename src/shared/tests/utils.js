const { User } = require("@models");

const user = {
  firstName: "John",
  lastName: "Dupe",
  email: "john@example.com",
  password: "StrongPass123!",
};

exports.userObject = user;

exports.createVerifiedUser = async () =>
  await User.create({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    passwordHash: user.password, //TODO: refactor to use hook to hash password
    profileImageUrl: "randomAvatar",
    verificationToken: "code",
    verificationTokenExpiresAt: Date.now(),
    isVerified: true,
    isOnboarded: false,
  });
