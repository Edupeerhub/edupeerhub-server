const SessionReminderService = require("./sessionReminderService");
const logger = require("@utils/logger");

class NotificationService {
  constructor() {
    this.sessionReminderService = new SessionReminderService();
    this.isInitialized = false;
  }

  /**
   * Initialize all notification services
   */
  async initialize() {
    if (this.isInitialized) {
      logger.warn("NotificationService is already initialized");
      return;
    }

    try {
      logger.info("Initializing NotificationService...");
      
      // Start session reminder service
      this.sessionReminderService.start();
      
      this.isInitialized = true;
      logger.info("NotificationService initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize NotificationService:", error);
      throw error;
    }
  }

  /**
   * Shutdown all notification services
   */
  async shutdown() {
    if (!this.isInitialized) return;

    try {
      logger.info("Shutting down NotificationService...");
      
      // Stop session reminder service
      this.sessionReminderService.stop();
      
      this.isInitialized = false;
      logger.info("NotificationService shutdown complete");
    } catch (error) {
      logger.error("Error during NotificationService shutdown:", error);
      throw error;
    }
  }

  /**
   * Get the session reminder service instance
   */
  getSessionReminderService() {
    return this.sessionReminderService;
  }

  /**
   * Get status of all notification services
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      sessionReminder: this.sessionReminderService.getStatus(),
    };
  }

  /**
   * Schedule reminders for a specific session (used when session is created/updated)
   * @param {Object} session - Session model instance
   */
  async scheduleSessionReminders(session) {
    if (!this.isInitialized) {
      throw new Error("NotificationService not initialized");
    }
    
    return this.sessionReminderService.scheduleSessionReminders(session);
  }

  /**
   * Cancel reminders for a specific session (used when session is cancelled)
   * @param {string} sessionId - Session ID
   */
  cancelSessionReminders(sessionId) {
    if (!this.isInitialized) {
      throw new Error("NotificationService not initialized");
    }
    
    return this.sessionReminderService.cancelSessionReminders(sessionId);
  }
}

// Create singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;