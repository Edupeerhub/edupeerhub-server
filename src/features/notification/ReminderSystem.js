const schedule = require("node-schedule");
const logger = require("@utils/logger");
const { Booking } = require("@models");
const { Op } = require("sequelize");
const { sendCallReminderEmail } = require("@src/shared/email/email.service");
const CallService = require("../chat/CallService");

const IS_TEST_MODE = process.env.NODE_ENV !== "production";

class ReminderService {
  constructor() {
    this.jobs = {};
    this.callService = new CallService();

    const parseEnv = (key, fallback) => {
      const raw = process.env[key];
      return raw !== undefined ? parseFloat(raw) : fallback;
    };

    this.reminderTimes = {
      reminderSlot1: parseEnv("REMINDER_TIME_1", 0.25), // default 15m
      reminderSlot2: parseEnv("REMINDER_TIME_2", 1), // default 1h
      reminderSlot3: parseEnv("REMINDER_TIME_3", 24), // default 24h
    };
  }

  // Run on server startup
  async loadUnsentReminders() {
    const now = new Date();
    const bookings = await Booking.scope("join").findAll({
      where: { scheduledStart: { [Op.gt]: now }, status: "confirmed" },
    });

    bookings.forEach((b) => this.scheduleSessionReminder(b));
    logger.info(`📬 Loaded ${bookings.length} bookings into ReminderService`);
  }

  // For new bookings
  scheduleSessionReminder(booking) {
    const start = new Date(booking.scheduledStart);
    const now = new Date();

    if (isNaN(start.getTime())) {
      logger.warn(`⚠️ Skipping booking ${booking.id}, invalid scheduledStart`);
      return;
    }

    Object.entries(this.reminderTimes).forEach(([slot, hrs]) => {
      const when = IS_TEST_MODE
        ? new Date(now.getTime() + hrs * 60 * 60 * 1000) // test = relative to now
        : new Date(start.getTime() - hrs * 60 * 60 * 1000); // prod = relative to booking start

      if (!IS_TEST_MODE && when <= now) return;
      if (booking.reminders?.[slot]) return; // already sent

      const jobId = `${booking.id}-${slot}`;
      this.jobs[jobId] = schedule.scheduleJob(when, () => {
        this.sendSessionReminder(booking, slot);
      });

      logger.info(
        `⏰ Scheduled ${slot} for booking ${booking.id} at ${when.toISOString()}`
      );
    });
  }

  rescheduleSessionReminder(booking) {
    this.cancelSessionReminder(booking.id);
    this.scheduleSessionReminder(booking);
    logger.info(`🔄 Rescheduled all reminders for booking ${booking.id}`);
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

  async sendSessionReminder(booking, slot) {
    const hours = this.reminderTimes[slot];
    const timeText = this.timeLabel(hours);

    logger.info(
      `📤 Sending ${slot} (${timeText}) reminder for booking ${booking.id}`
    );

    const { tutorCallUrl, studentCallUrl } =
      await this.callService.getCallLinks(booking);

    await sendCallReminderEmail({
      tutorEmail: booking.tutor?.user?.email,
      studentEmail: booking.student?.user?.email,
      tutorCallUrl,
      studentCallUrl,
      type: timeText,
    });

    // Mark as sent
    await Booking.update(
      { reminders: { ...booking.reminders, [slot]: true } },
      { where: { id: booking.id } }
    );

    logger.info(
      `✅ ${slot} (${timeText}) reminder sent for booking ${booking.id}`
    );
  }

  timeLabel(hours) {
    if (hours >= 24 && hours % 24 === 0) {
      const days = hours / 24;
      return `in ${days} ${days === 1 ? "day" : "days"}`;
    }
    if (hours >= 1) {
      return `in ${hours} ${hours === 1 ? "hour" : "hours"}`;
    }
    return `in ${Math.round(hours * 60)} minutes`;
  }
}

module.exports = ReminderService;
