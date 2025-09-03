module.exports = {
  signup: {
    max: 5,
    windowMs: 10 * 60 * 1000,
    message: "Too many signup attempts. Try again later.",
  }, // 10 min
  login: {
    max: 4,
    windowMs: 30 * 1000,
    message: "Too many login attempts. Please try again later.",
  }, // 30 sec
  verifyEmail: {
    max: 5,
    windowMs: 10 * 60 * 1000,
    message: "Too many verification attempts. Try again later.",
  }, // 10 min
  forgotPassword: {
    max: 3,
    windowMs: 15 * 60 * 1000,
    message: "Too many password reset requests. Try again later.",
  }, // 15 min
  resetPassword: {
    max: 5,
    windowMs: 10 * 60 * 1000,
    message: "Too many reset attempts. Try again later.",
  }, // 10 min
  resendVerification: {
    max: 3,
    windowMs: 60 * 60 * 1000,
    message: "Too many resend requests. Try again later.",
  }, // 1 hour
};
