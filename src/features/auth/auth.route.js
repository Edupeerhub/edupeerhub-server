const express = require("express");
const authController = require("./auth.controller");
const validate = require("@src/shared/middlewares/validate.middleware");
const authValidation = require("./auth.validator");
const { protectRoute } = require("./auth.middleware");
const createRateLimiter = require("@src/shared/middlewares/rateLimit.middleware");
const rateLimitConfig = require("@src/shared/config/rateLimit.config");

const router = express.Router();

// Public auth routes
router.post(
  "/signup",
  createRateLimiter(rateLimitConfig.signup),
  validate(authValidation.signup),
  authController.signup
);

router.post(
  "/login",
  createRateLimiter(rateLimitConfig.login),
  validate(authValidation.login),
  authController.login
);

router.post(
  "/forgot-password",
  createRateLimiter(rateLimitConfig.forgotPassword),
  validate(authValidation.forgotPassword),
  authController.forgotPassword
);

router.post(
  "/reset/:token",
  createRateLimiter(rateLimitConfig.resetPassword),
  validate(authValidation.resetPassword),
  authController.resetPassword
);

// Protected routes
router.use(protectRoute);

router.get("/me", authController.profile);
router.post(
  "/verify-email",
  createRateLimiter(rateLimitConfig.verifyEmail),
  validate(authValidation.verifyEmail),
  authController.verifyEmail
);

router.post(
  "/resend-email-verification",
  createRateLimiter(rateLimitConfig.resendVerification),
  authController.resendEmail
);

router.put(
  "/change-password",
  validate(authValidation.changePassword),
  authController.changePassword
);

router.post("/logout", authController.logout);

module.exports = router;
