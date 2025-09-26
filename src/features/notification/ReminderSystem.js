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

    logger.info("Env values", {
      REMINDER_TIME_1: process.env.REMINDER_TIME_1,
      REMINDER_TIME_2: process.env.REMINDER_TIME_2,
      REMINDER_TIME_3: process.env.REMINDER_TIME_3,
    });

    const parseEnv = (key, fallback) => {
      const raw = process.env[key];
      return raw !== undefined ? parseFloat(raw) : fallback;
    };

    this.reminderTimes = {
      reminderSlot1: parseEnv("REMINDER_TIME_1", 24), // default 24h
      reminderSlot2: parseEnv("REMINDER_TIME_2", 1), // default 1h
      reminderSlot3: parseEnv("REMINDER_TIME_3", 0.25), // default 15m
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

    Object.entries(this.reminderTimes).forEach(([key, hrs]) => {
      const when = IS_TEST_MODE
        ? new Date(now.getTime() + hrs * 60 * 60 * 1000) // test = relative to now
        : new Date(start.getTime() - hrs * 60 * 60 * 1000); // prod = relative to booking start

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
    logger.info(
      `🔥 sendSessionReminder fired for booking ${booking.id} [${type}]`
    );

    const hours = this.reminderTimes[type]; // get hours value
    const timeText = this.timeLabel(hours);

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
    // await Booking.update(
    //   { reminders: { ...booking.reminders, [type]: true } },
    //   { where: { id: booking.id } }
    // );

    logger.info(`✅ Sent ${type} reminder for booking ${booking.id}`);
  }

  timeLabel(hours) {
    if (hours >= 1) {
      return `${hours} ${hours === 1 ? "hour" : "hours"}`;
    }
    return `${hours * 60} minutes`;
  }
}

module.exports = ReminderService;
