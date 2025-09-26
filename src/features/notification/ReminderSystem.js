const schedule = require("node-schedule");
const logger = require("@utils/logger");
const { Booking } = require("@models");
const { Op } = require("sequelize");
const { sendCallReminderEmail } = require("@src/shared/email/email.service");
const CallService = require("../chat/CallService");

class ReminderService {
  constructor() {
    this.jobs = {};
    this.callService = new CallService();

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
      where: { scheduledStart: { [Op.gt]: now }, status: "confirmed" },
    });

    bookings.forEach((b) => this.scheduleSessionReminder(b));
    logger.info(`📬 Loaded ${bookings.length} bookings into ReminderService`);
  }

  // For new bookings
  scheduleSessionReminder(booking) {
    const start = new Date(booking.scheduledStart);
    const now = new Date();

    Object.entries(this.reminderTimes).forEach(([key, hrs]) => {
      const when = new Date(start - hrs * 60 * 60 * 1000);
      if (when <= now) return;

      // only schedule if not already sent
      if (booking.reminders?.[key]) return;

      const jobId = `${booking.id}-${key}`;
      this.jobs[jobId] = schedule.scheduleJob(when, () => {
        this.sendSessionReminder(booking, key);
      });

      logger.info(`⏰ Scheduled ${jobId} at ${when.toISOString()}`);
    });
  }

  rescheduleSessionReminder(booking) {
    this.cancelSessionReminder(booking.id);
    this.scheduleSessionReminder(booking);
    logger.info(`🔄 Rescheduled reminders for booking ${booking.id}`);
  }

  cancelSessionReminder(bookingId) {
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

    const { tutorCallUrl, studentCallUrl } =
      await this.callService.getCallLinks(booking);

    await sendCallReminderEmail({
      tutorEmail: booking.tutor?.user?.email,
      studentEmail: booking.student?.user?.email,
      tutorCallUrl,
      studentCallUrl,
      type: timeText,
    });

    // mark flag as sent
    await booking.update({ reminders: { ...booking.reminders, [type]: true } });

    logger.info(`✅ Sent ${type} reminder for booking ${booking.id}`);
  }

  timeLabel(type) {
    return (
      { "24h": "24 hours", "1h": "1 hour", "15m": "15 minutes" }[type] || "soon"
    );
  }
}

module.exports = ReminderService;
