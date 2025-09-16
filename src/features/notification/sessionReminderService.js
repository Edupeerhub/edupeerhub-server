const schedule = require("node-schedule");
const logger = require("@utils/logger");
const emailService = require("@src/shared/email/email.service");
const { SESSION_REMINDER_TEMPLATE } = require("@src/shared/email/emailTemplates");
const { Op } = require("sequelize");

class SessionReminderService {
  constructor() {
    this.reminderJobs = new Map();
    this.isRunning = false;
    
    // Load reminder times from environment (in hours, converted to milliseconds)
    this.reminderTimes = {
      "24_hours": (parseFloat(process.env.REMINDER_24_HOURS) || 24) * 60 * 60 * 1000,
      "1_hour": (parseFloat(process.env.REMINDER_1_HOUR) || 1) * 60 * 60 * 1000,
      "15_minutes": (parseFloat(process.env.REMINDER_15_MINUTES) || 0.25) * 60 * 60 * 1000,
    };

    logger.info("SessionReminderService initialized with times:", {
      "24_hours": `${this.reminderTimes["24_hours"] / (60 * 60 * 1000)}h`,
      "1_hour": `${this.reminderTimes["1_hour"] / (60 * 60 * 1000)}h`,
      "15_minutes": `${this.reminderTimes["15_minutes"] / (60 * 60 * 1000)}h`,
    });
  }

  /**
   * Start the reminder service
   * Schedules periodic checks for sessions that need reminders
   */
  start() {
    if (this.isRunning) {
      logger.warn("SessionReminderService is already running");
      return;
    }

    logger.info("Starting SessionReminderService...");
    this.isRunning = true;

    // Run check every 5 minutes
    this.checkJob = schedule.scheduleJob("*/5 * * * *", async () => {
      try {
        await this.processUpcomingSessions();
      } catch (error) {
        logger.error("Error processing upcoming sessions:", error);
      }
    });

    // Initial check on startup
    this.processUpcomingSessions().catch(error => {
      logger.error("Error in initial session check:", error);
    });

    logger.info("SessionReminderService started successfully");
  }

  /**
   * Stop the reminder service
   */
  stop() {
    if (!this.isRunning) return;

    logger.info("Stopping SessionReminderService...");
    this.isRunning = false;

    // Cancel main check job
    if (this.checkJob) {
      this.checkJob.cancel();
    }

    // Cancel all reminder jobs
    this.reminderJobs.forEach((jobs, sessionId) => {
      jobs.forEach(job => job.cancel());
    });
    this.reminderJobs.clear();

    logger.info("SessionReminderService stopped");
  }

  /**
   * Process all upcoming sessions and schedule reminders
   */
  async processUpcomingSessions() {
    try {
      const models = require("@src/shared/database/models");
      const { Session } = models;

      // Get upcoming sessions that haven't been cancelled
      const upcomingSessions = await Session.scope("withDetails").findAll({
        where: {
          scheduledAt: {
            [Op.gte]: new Date(),
          },
          status: ["scheduled", "confirmed"],
        },
        order: [["scheduledAt", "ASC"]],
      });

      logger.info(`Processing ${upcomingSessions.length} upcoming sessions for reminders`);

      for (const session of upcomingSessions) {
        await this.scheduleSessionReminders(session);
      }
    } catch (error) {
      logger.error("Error processing upcoming sessions:", error);
      throw error;
    }
  }

  /**
   * Schedule all reminders for a specific session
   * @param {Object} session - Session model instance
   */
  async scheduleSessionReminders(session) {
    const sessionId = session.id;
    const scheduledAt = new Date(session.scheduledAt);
    const now = new Date();

    // Skip if session is too soon or already started
    if (scheduledAt <= now) {
      return;
    }

    // Cancel existing reminders for this session
    if (this.reminderJobs.has(sessionId)) {
      this.reminderJobs.get(sessionId).forEach(job => job.cancel());
    }

    const reminderJobs = [];

    // Schedule each reminder type
    for (const [reminderType, timeBeforeMs] of Object.entries(this.reminderTimes)) {
      const reminderTime = new Date(scheduledAt.getTime() - timeBeforeMs);

      // Skip if reminder time has already passed
      if (reminderTime <= now) {
        continue;
      }

      // Skip if reminder was already sent
      if (session.remindersSent && session.remindersSent[reminderType]) {
        continue;
      }

      const job = schedule.scheduleJob(reminderTime, async () => {
        try {
          await this.sendSessionReminder(session, reminderType);
        } catch (error) {
          logger.error(`Error sending ${reminderType} reminder for session ${sessionId}:`, error);
        }
      });

      if (job) {
        reminderJobs.push(job);
        logger.info(`Scheduled ${reminderType} reminder for session ${sessionId} at ${reminderTime.toISOString()}`);
      }
    }

    if (reminderJobs.length > 0) {
      this.reminderJobs.set(sessionId, reminderJobs);
    }
  }

  /**
   * Send reminder email for a session
   * @param {Object} session - Session model instance
   * @param {string} reminderType - Type of reminder (24_hours, 1_hour, 15_minutes)
   */
  async sendSessionReminder(session, reminderType) {
    try {
      const models = require("@src/shared/database/models");
      const { Session } = models;

      // Refresh session data to get latest status
      const currentSession = await Session.scope("withDetails").findByPk(session.id);
      
      if (!currentSession) {
        logger.warn(`Session ${session.id} not found when sending ${reminderType} reminder`);
        return;
      }

      // Skip if session was cancelled or completed
      if (!["scheduled", "confirmed"].includes(currentSession.status)) {
        logger.info(`Skipping ${reminderType} reminder for session ${session.id} - status: ${currentSession.status}`);
        return;
      }

      // Skip if reminder was already sent
      if (currentSession.remindersSent && currentSession.remindersSent[reminderType]) {
        logger.info(`${reminderType} reminder already sent for session ${session.id}`);
        return;
      }

      const studentEmail = currentSession.student.user.email;
      const tutorEmail = currentSession.tutor.user.email;
      const studentName = `${currentSession.student.user.firstName} ${currentSession.student.user.lastName}`;
      const tutorName = `${currentSession.tutor.user.firstName} ${currentSession.tutor.user.lastName}`;

      // Determine time until session for email content
      const timeUntil = this.getTimeUntilText(reminderType);
      const sessionDate = new Date(currentSession.scheduledAt).toLocaleString("en-US", {
        timeZone: currentSession.tutor.timezone || "UTC",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });

      // Send reminder to student
      await this.sendReminderEmail(
        studentEmail,
        studentName,
        "student",
        {
          session: currentSession,
          timeUntil,
          sessionDate,
          otherPersonName: tutorName,
          otherPersonRole: "tutor",
        }
      );

      // Send reminder to tutor
      await this.sendReminderEmail(
        tutorEmail,
        tutorName,
        "tutor",
        {
          session: currentSession,
          timeUntil,
          sessionDate,
          otherPersonName: studentName,
          otherPersonRole: "student",
        }
      );

      // Mark reminder as sent
      const updatedReminders = {
        ...currentSession.remindersSent,
        [reminderType]: true,
      };

      await currentSession.update({
        remindersSent: updatedReminders,
      });

      logger.info(`Successfully sent ${reminderType} reminder for session ${session.id}`);
    } catch (error) {
      logger.error(`Error sending ${reminderType} reminder for session ${session.id}:`, error);
      throw error;
    }
  }

  /**
   * Send reminder email to a recipient
   */
  async sendReminderEmail(email, recipientName, recipientRole, sessionData) {
    const { session, timeUntil, sessionDate, otherPersonName, otherPersonRole } = sessionData;

    const subject = `Reminder: Your ${session.subject.name} session is in ${timeUntil}`;
    
    const htmlContent = SESSION_REMINDER_TEMPLATE({
      recipientName,
      recipientRole,
      otherPersonName,
      otherPersonRole,
      subject: session.subject.name,
      sessionDate,
      timeUntil,
      meetingUrl: session.meetingUrl,
      duration: session.duration,
    });

    // Use the sendEmail utility directly since emailService methods are specific
    const { sendEmail } = require("@src/shared/email/email.utils");
    
    await sendEmail({
      to: [{ email }],
      subject,
      html: htmlContent,
      category: "Session Reminder",
    });
  }

  /**
   * Get human-readable time until text
   */
  getTimeUntilText(reminderType) {
    switch (reminderType) {
      case "24_hours":
        return "24 hours";
      case "1_hour":
        return "1 hour";
      case "15_minutes":
        return "15 minutes";
      default:
        return "soon";
    }
  }

  /**
   * Manually trigger reminders for a specific session (for testing/debugging)
   * @param {string} sessionId - Session ID
   */
  async triggerSessionReminders(sessionId) {
    try {
      const models = require("@src/shared/database/models");
      const { Session } = models;

      const session = await Session.scope("withDetails").findByPk(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      await this.scheduleSessionReminders(session);
      logger.info(`Manually triggered reminders for session ${sessionId}`);
    } catch (error) {
      logger.error(`Error triggering reminders for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel reminders for a specific session (e.g., when session is cancelled)
   * @param {string} sessionId - Session ID
   */
  cancelSessionReminders(sessionId) {
    if (this.reminderJobs.has(sessionId)) {
      const jobs = this.reminderJobs.get(sessionId);
      jobs.forEach(job => job.cancel());
      this.reminderJobs.delete(sessionId);
      logger.info(`Cancelled reminders for session ${sessionId}`);
    }
  }

  /**
   * Get status information about the reminder service
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: this.reminderJobs.size,
      reminderTimes: Object.fromEntries(
        Object.entries(this.reminderTimes).map(([key, ms]) => [
          key,
          `${ms / (60 * 60 * 1000)}h`
        ])
      ),
    };
  }
}

module.exports = SessionReminderService;