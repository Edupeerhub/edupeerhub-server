const schedule = require("node-schedule");

class ReminderSystem {
  constructor(emailService) {
    this.jobs = {};
    this.emailService = emailService || { send: (r, c) => console.log(r, c) };
  }

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
}

module.exports = ReminderSystem;
