const schedule = require("node-schedule");
const logger = require("@utils/logger");
const { Booking } = require("./models");
const { Op } = require("sequelize");

class ReminderService {
  constructor(emailService) {
    this.jobs = {};
    this.emailService = emailService; // <- your own email service
    this.reminderTimes = {
      "24h": parseFloat(process.env.REMINDER_24_HOURS) || 24,
      "1h": parseFloat(process.env.REMINDER_1_HOUR) || 1,
      "15m": parseFloat(process.env.REMINDER_15_MINUTES) || 0.25,
    };
  }

  // Run on server startup
  async loadUnsentReminders() {
    const now = new Date();
    const bookings = await Booking.findAll({
      where: { scheduledAt: { [Op.gt]: now } },
    });

    bookings.forEach((b) => this.scheduleSession(b));
    logger.info(`📬 Loaded ${bookings.length} bookings into ReminderService`);
  }

  // For new bookings
  scheduleSession(booking) {
    const start = new Date(booking.scheduledAt);
    const now = new Date();

    Object.entries(this.reminderTimes).forEach(([key, hrs]) => {
      const when = new Date(start - hrs * 60 * 60 * 1000);
      if (when <= now) return;

      // only schedule if not already sent
      if (booking[`reminder${key}Sent`]) return;

      const jobId = `${booking.id}-${key}`;
      this.jobs[jobId] = schedule.scheduleJob(when, () => {
        this.sendSessionReminder(booking, key);
      });

      logger.info(`⏰ Scheduled ${jobId} at ${when.toISOString()}`);
    });
  }

  rescheduleSession(booking) {
    this.cancelSession(booking.id);
    this.scheduleSession(booking);
    logger.info(`🔄 Rescheduled reminders for booking ${booking.id}`);
  }

  cancelSession(bookingId) {
    Object.keys(this.jobs)
      .filter((jobId) => jobId.startsWith(`${bookingId}-`))
      .forEach((jobId) => {
        this.jobs[jobId].cancel();
        delete this.jobs[jobId];
        logger.info(`❌ Cancelled ${jobId}`);
      });
  }

  async sendSessionReminder(booking, type) {
    const timeText = this.timeLabel(type);

    const content = {
      subject: `Reminder: ${booking.subject} in ${timeText}`,
      body: `Your session starts in ${timeText}. Meeting: ${booking.meetingUrl || "N/A"}`,
    };

    await this.emailService.send(booking.studentEmail, content);
    await this.emailService.send(booking.tutorEmail, content);

    // mark flag as sent
    await booking.update({ [`reminder${type}Sent`]: true });

    logger.info(`✅ Sent ${type} reminder for booking ${booking.id}`);
  }

  timeLabel(type) {
    return (
      { "24h": "24 hours", "1h": "1 hour", "15m": "15 minutes" }[type] || "soon"
    );
  }
}

module.exports = ReminderService;
