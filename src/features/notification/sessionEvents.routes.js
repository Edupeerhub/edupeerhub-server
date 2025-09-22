// routes/sessionEvents.js
const express = require("express");
const router = express.Router();
const trackSessionEvent = require("@services/trackSessionEvent");

router.post("/started", async (req, res, next) => {
  const { sessionId, userId, tutorId } = req.body;
  try {
    await trackSessionEvent("session_started", {
      sessionId,
      userId,
      tutorId,
      startedAt: new Date(),
    });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post("/completed", async (req, res, next) => {
  const { sessionId, userId, tutorId, startedAt } = req.body;
  try {
    const endedAt = new Date();
    const durationSecs = startedAt
      ? Math.round((endedAt - new Date(startedAt)) / 1000)
      : null;

    await trackSessionEvent("session_completed", {
      sessionId,
      userId,
      tutorId,
      endedAt,
      durationSecs,
    });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
