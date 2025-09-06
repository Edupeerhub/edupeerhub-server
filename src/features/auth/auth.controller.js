const sendResponse = require("@utils/sendResponse");
const {
  addStreamUser,
  changeUserPassword,
  createUser,
  fetchProfile,
  forgotUserPassword,
  loginUser,
  resendVerificationEmail,
  resetUserPassword,
  verifyUserEmail,
} = require("./auth.service");
const {
  sendPasswordChangeSuccessEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} = require("@src/shared/email/email.service");
const trackEvent = require("@features/events/events.service");
const eventTypes = require("@features/events/eventTypes");
const ApiError = require("@src/shared/utils/apiError");
const { setAuthCookie, clearAuthCookie } = require("@src/shared/utils/cookies");

exports.signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const newUser = await createUser({
      firstName,
      lastName,
      email,
      password,
    });

    await sendVerificationEmail(newUser.email, newUser.verificationToken);
    // await addStreamUser(newUser);

    const token = newUser.generateAuthToken();

    await trackEvent(eventTypes.USER_SIGNED_UP, {
      userId: newUser.id,
      email: newUser.email,
      fullName: `${newUser.firstName} ${newUser.lastName}`,
    });

    setAuthCookie(res, token);

    sendResponse(res, 201, "User registered successfully", {
      id: newUser.id,
      email: newUser.email,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await loginUser({ ...req.body });
    const token = user.generateAuthToken();

    await trackEvent(eventTypes.USER_LOGGED_IN, {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: `${user.firstName} ${user.lastName}`,
      date: user.lastLogin,
    });

    setAuthCookie(res, token);

    sendResponse(res, 200, "User signed in successfully", {
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

exports.profile = async (req, res, next) => {
  try {
    const user = await fetchProfile(req.user.id);
    sendResponse(res, 200, "Profile fetch successful", user);
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res, next) => {
  clearAuthCookie(res);

  sendResponse(res, 200, "Logout Successful");
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body;
    const verifiedUser = await verifyUserEmail(code);

    await sendWelcomeEmail(verifiedUser.email, verifiedUser.firstName);
    await trackEvent(eventTypes.USER_VERIFIED_EMAIL, {
      userId: verifiedUser.id,
      email: verifiedUser.email,
      role: verifiedUser.role,
      fullName: `${verifiedUser.firstName} ${verifiedUser.lastName}`,
    });
    sendResponse(res, 200, "Email verified successfully", {
      id: verifiedUser.id,
      email: verifiedUser.email,
    });
  } catch (error) {
    next(error);
  }
};

exports.resendEmail = async (req, res, next) => {
  try {
    const user = await resendVerificationEmail(req.user.id);
    await sendVerificationEmail(user.email, user.verificationToken);

    sendResponse(res, 200, "Verification email resent successfully");
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const result = await forgotUserPassword(req.body.email);

    if (result) {
      await sendPasswordResetEmail(
        result.userEmail,
        `${process.env.CLIENT_URL}/reset-password/${result.resetToken}`
      );
      sendResponse(res, 200, "Password reset link sent to your email");
    }else{
      throw new ApiError( "User not found", 404,);
    }

  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const email = await resetUserPassword(token, req.body.password);

    await sendResetSuccessEmail(email);
    sendResponse(res, 200, "Password reset successful");
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const result = await changeUserPassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword
    );

    await sendPasswordChangeSuccessEmail(result.email);
    sendResponse(res, 200, "Password changed successfully", {
      id: result.id,
      email: result.email,
    });
  } catch (error) {
    next(error);
  }
};
