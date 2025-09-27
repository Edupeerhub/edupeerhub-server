const express = require("express");

const {
  protectRoute,
  requireVerifiedAndOnboardedUser,
} = require("../auth/auth.middleware");
const { getStreamToken, handleStreamWebhook } = require("./chat.controller");

const router = express.Router();

router.post("/webhook", express.json(), handleStreamWebhook);

router.get(
  "/token",
  protectRoute,
  requireVerifiedAndOnboardedUser,
  getStreamToken
);

module.exports = router;
