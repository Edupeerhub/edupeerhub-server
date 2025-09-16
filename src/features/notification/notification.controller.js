const sendResponse = require("@utils/sendResponse");
const ApiError = require("@utils/apiError");
const notificationService = require("./notification.service");
const logger = require("@utils/logger");

/**
 * Get notification service status
 */
const getNotificationStatus = async (req, res, next) => {
  try {
    const status = notificationService.getStatus();
    sendResponse(res, 200, "Notification service status retrieved successfully", status);
  } catch (error) {
    next(error);
  }
};

/**
 * Manually trigger reminders for a session (for testing/debugging)
 */
const triggerSessionReminders = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      throw new ApiError("Session ID is required", 400);
    }

    const reminderService = notificationService.getSessionReminderService();
    await reminderService.triggerSessionReminders(sessionId);

    sendResponse(res, 200, `Reminders triggered for session ${sessionId}`, {
      sessionId,
      message: "Reminders have been scheduled",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel reminders for a session
 */
const cancelSessionReminders = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      throw new ApiError("Session ID is required", 400);
    }

    notificationService.cancelSessionReminders(sessionId);

    sendResponse(res, 200, `Reminders cancelled for session ${sessionId}`, {
      sessionId,
      message: "All reminders have been cancelled",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Test session reminder with mock data (for development/testing)
 */
const testSessionReminder = async (req, res, next) => {
  try {
    const { 
      reminderType = "15_minutes", 
      testEmail = "test@example.com",
      delaySeconds = 30 
    } = req.body;

    // Create mock session data
    const mockSession = {
      id: "test-session-" + Date.now(),
      scheduledAt: new Date(Date.now() + delaySeconds * 1000), // Schedule for X seconds from now
      duration: 60,
      status: "scheduled",
      meetingUrl: "https://zoom.us/j/123456789",
      remindersSent: {
        "24_hours": false,
        "1_hour": false,
        "15_minutes": false,
      },
      student: {
        user: {
          email: testEmail,
          firstName: "Test",
          lastName: "Student",
        },
      },
      tutor: {
        user: {
          email: "tutor@example.com",
          firstName: "Test",
          lastName: "Tutor",
        },
        timezone: "UTC",
      },
      subject: {
        name: "Mathematics",
      },
    };

    const reminderService = notificationService.getSessionReminderService();
    
    // Send test reminder immediately
    await reminderService.sendSessionReminder(mockSession, reminderType);

    logger.info(`Test session reminder sent for ${reminderType}`);

    sendResponse(res, 200, "Test session reminder sent successfully", {
      testEmail,
      reminderType,
      message: "Check your email for the test reminder",
      mockSessionId: mockSession.id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process all upcoming sessions (manual trigger for testing)
 */
const processUpcomingSessions = async (req, res, next) => {
  try {
    const reminderService = notificationService.getSessionReminderService();
    await reminderService.processUpcomingSessions();

    sendResponse(res, 200, "Processed all upcoming sessions for reminders", {
      message: "All upcoming sessions have been processed for reminder scheduling",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotificationStatus,
  triggerSessionReminders,
  cancelSessionReminders,
  testSessionReminder,
  processUpcomingSessions,
};