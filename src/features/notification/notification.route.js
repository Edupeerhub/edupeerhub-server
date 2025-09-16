const express = require("express");
const {
  getNotificationStatus,
  triggerSessionReminders,
  cancelSessionReminders,
  testSessionReminder,
  processUpcomingSessions,
} = require("./notification.controller");

const router = express.Router();

/**
 * @route GET /api/notification/status
 * @desc Get notification service status
 * @access Public (for now - should be admin only in production)
 */
router.get("/status", getNotificationStatus);

/**
 * @route POST /api/notification/sessions/:sessionId/trigger-reminders
 * @desc Manually trigger reminders for a specific session
 * @access Admin/Testing
 */
router.post("/sessions/:sessionId/trigger-reminders", triggerSessionReminders);

/**
 * @route DELETE /api/notification/sessions/:sessionId/reminders
 * @desc Cancel all reminders for a specific session
 * @access Admin/Testing
 */
router.delete("/sessions/:sessionId/reminders", cancelSessionReminders);

/**
 * @route POST /api/notification/test-reminder
 * @desc Send a test session reminder email
 * @access Testing/Development
 */
router.post("/test-reminder", testSessionReminder);

/**
 * @route POST /api/notification/process-sessions
 * @desc Manually process all upcoming sessions for reminder scheduling
 * @access Admin/Testing
 */
router.post("/process-sessions", processUpcomingSessions);

module.exports = router;