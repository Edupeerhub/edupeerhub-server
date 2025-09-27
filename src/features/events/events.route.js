const express = require("express");
const router = express.Router();
const trackEvent = require("./events.service");
const { SESSION_STARTED, SESSION_COMPLETED } = require("./eventTypes");
const { Booking } = require("@models");

router.post("/session/started", async (req, res, next) => {
  const { sessionId, studentId, tutorId } = req.body;
  try {
    await trackEvent(SESSION_STARTED, {
      sessionId,
      studentId,
      tutorId,
      startedAt: new Date(),
    });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post("/session/completed", async (req, res, next) => {
  const { sessionId, studentId, tutorId, startedAt } = req.body;
  try {
    const endedAt = new Date();
    const durationSecs = startedAt
      ? Math.round((endedAt - new Date(startedAt)) / 1000)
      : null;

    const booking = await Booking.findOne({ where: { id: sessionId } });
    booking.status = "completed";
    await booking.save();

    await trackEvent(SESSION_COMPLETED, {
      sessionId,
      studentId,
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
