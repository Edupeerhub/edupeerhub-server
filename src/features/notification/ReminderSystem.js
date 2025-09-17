const schedule = require("node-schedule");
const logger = require("@utils/logger");

class ReminderSystem {
  constructor(emailService) {
    this.jobs = {};
    this.sessionJobs = {};
    this.emailService = emailService || { send: (r, c) => console.log(r, c) };
    
    // Load reminder times from environment (in hours)
    this.reminderTimes = {
      "24_hours": parseFloat(process.env.REMINDER_24_HOURS) || 24,
      "1_hour": parseFloat(process.env.REMINDER_1_HOUR) || 1,
      "15_minutes": parseFloat(process.env.REMINDER_15_MINUTES) || 0.25,
    };
    
    this.isRunning = false;
    
    logger.info("ReminderSystem initialized with session reminder times:", {
      "24_hours": `${this.reminderTimes["24_hours"]}h`,
      "1_hour": `${this.reminderTimes["1_hour"]}h`, 
      "15_minutes": `${this.reminderTimes["15_minutes"]}h`,
    });
  }

  // Original reminder functionality
  scheduleReminder(datetime, recipients, content, jobId) {
    const job = schedule.scheduleJob(datetime, async () => {
      console.log(`📧 Sending reminder: ${jobId}`);
      for (const r of recipients) {
        try {
          await this.sendEmail(r, content);
        } catch (err) {
          console.error(`Failed for ${r.email}:`, err);
        }
      }
    });

    this.jobs[jobId] = job;
    console.log(`⏰ Scheduled ${jobId} at ${datetime.toISOString()}`);
  }

  cancelReminder(jobId) {
    const job = this.jobs[jobId];
    if (job) {
      job.cancel();
      delete this.jobs[jobId];
      console.log(`❌ Cancelled job ${jobId}`);
    }
  }

  rescheduleReminder(jobId, newDatetime) {
    const job = this.jobs[jobId];
    if (job) {
      job.reschedule(newDatetime);
      console.log(`⏰ Rescheduled ${jobId} to ${newDatetime.toISOString()}`);
    }
  }

  sendEmail(recipient, content) {
    this.emailService.send(recipient, content);
  }

  // NEW: Session reminder functionality
  scheduleSessionReminders(session) {
    const sessionId = session.id;
    const scheduledAt = new Date(session.scheduledAt);
    const now = new Date();

    // Cancel existing reminders for this session
    this.cancelSessionReminders(sessionId);

    const sessionJobGroup = [];

    // Schedule each reminder type
    Object.entries(this.reminderTimes).forEach(([reminderType, hoursBefore]) => {
      const reminderTime = new Date(scheduledAt.getTime() - (hoursBefore * 60 * 60 * 1000));

      // Skip if reminder time has already passed
      if (reminderTime <= now) {
        return;
      }

      const jobId = `${sessionId}-${reminderType}`;
      const job = schedule.scheduleJob(reminderTime, async () => {
        try {
          await this.sendSessionReminder(session, reminderType);
        } catch (error) {
          logger.error(`Error sending ${reminderType} reminder for session ${sessionId}:`, error);
        }
      });

      if (job) {
        sessionJobGroup.push(job);
        logger.info(`📅 Scheduled ${reminderType} reminder for session ${sessionId} at ${reminderTime.toISOString()}`);
      }
    });

    if (sessionJobGroup.length > 0) {
      this.sessionJobs[sessionId] = sessionJobGroup;
    }
  }

  async sendSessionReminder(session, reminderType) {
    const timeUntilText = this.getTimeUntilText(reminderType);
    
    const emailContent = {
      subject: `Session Reminder: ${session.subject} in ${timeUntilText}`,
      body: this.createSessionReminderEmail(session, timeUntilText)
    };

    // Send to student
    if (session.studentEmail) {
      await this.sendEmail({ email: session.studentEmail }, emailContent);
    }

    // Send to tutor  
    if (session.tutorEmail) {
      await this.sendEmail({ email: session.tutorEmail }, emailContent);
    }

    logger.info(`✅ Sent ${reminderType} reminder for session ${session.id}`);
  }

  createSessionReminderEmail(session, timeUntil) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D9A95;">🔔 Session Reminder</h2>
        
        <p>Your tutoring session is starting in <strong>${timeUntil}</strong>!</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>📚 Session Details:</h3>
          <p><strong>Subject:</strong> ${session.subject}</p>
          <p><strong>Date & Time:</strong> ${new Date(session.scheduledAt).toLocaleString()}</p>
          <p><strong>Duration:</strong> ${session.duration} minutes</p>
          ${session.meetingUrl ? `<p><strong>Meeting Link:</strong> <a href="${session.meetingUrl}">${session.meetingUrl}</a></p>` : ''}
        </div>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 5px;">
          <h4>✅ Before your session:</h4>
          <ul>
            <li>Test your camera and microphone</li>
            <li>Ensure stable internet connection</li>
            <li>Prepare materials and questions</li>
            <li>Find a quiet space</li>
          </ul>
        </div>
        
        <p style="margin-top: 20px;">Good luck with your session!</p>
        <p><em>- EduPeerHub Team</em></p>
      </div>
    `;
  }

  getTimeUntilText(reminderType) {
    switch (reminderType) {
      case "24_hours": return "24 hours";
      case "1_hour": return "1 hour";
      case "15_minutes": return "15 minutes";
      default: return "soon";
    }
  }

  cancelSessionReminders(sessionId) {
    if (this.sessionJobs[sessionId]) {
      this.sessionJobs[sessionId].forEach(job => job.cancel());
      delete this.sessionJobs[sessionId];
      logger.info(`❌ Cancelled all reminders for session ${sessionId}`);
    }
  }

  // Service lifecycle
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info("📬 ReminderSystem service started");
  }

  stop() {
    if (!this.isRunning) return;
    
    // Cancel all jobs
    Object.values(this.jobs).forEach(job => job.cancel());
    Object.values(this.sessionJobs).forEach(jobs => jobs.forEach(job => job.cancel()));
    
    this.jobs = {};
    this.sessionJobs = {};
    this.isRunning = false;
    
    logger.info("🛑 ReminderSystem service stopped");
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: Object.keys(this.jobs).length,
      activeSessionJobs: Object.keys(this.sessionJobs).length,
      reminderTimes: this.reminderTimes
    };
  }
}

module.exports = ReminderSystem;