// const axios = require("axios");
// require("dotenv").config();

// class ZoomScheduler {
//   constructor() {
//     this.accessToken = null;
//     this.baseURL = "https://api.zoom.us/v2";
//   }

//   async getAccessToken() {
//     const authString = Buffer.from(
//       `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
//     ).toString("base64");

//     try {
//       const response = await axios.post(
//         "https://zoom.us/oauth/token",
//         `grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
//         {
//           headers: {
//             Authorization: `Basic ${authString}`,
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//         }
//       );

//       this.accessToken = response.data.access_token;
//       console.log("✅ Access token obtained");
//       return this.accessToken;
//     } catch (error) {
//       console.error("❌ Token error:", error.response?.data || error.message);
//       throw error;
//     }
//   }

//   async createMeeting(meetingDetails) {
//     if (!this.accessToken) {
//       await this.getAccessToken();
//     }

//     const meetingData = {
//       topic: `${meetingDetails.subject} - Tutoring Session`,
//       type: 2, // Scheduled meeting
//       start_time: meetingDetails.startTime,
//       duration: meetingDetails.duration || 30,
//       timezone: meetingDetails.timezone || "UTC",
//       agenda: `1-on-1 tutoring session for ${meetingDetails.subject}`,
//       settings: {
//         host_video: true,
//         participant_video: true,
//         join_before_host: false,
//         mute_participants_upon_entry: true,
//       },
//     };

//     try {
//       const response = await axios.post(
//         `${this.baseURL}/users/me/meetings`,
//         meetingData,
//         {
//           headers: {
//             Authorization: `Bearer ${this.accessToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log("✅ Meeting created successfully!");
//       return {
//         id: response.data.id,
//         topic: response.data.topic,
//         startUrl: response.data.start_url,
//         joinUrl: response.data.join_url,
//         startTime: response.data.start_time,
//         duration: response.data.duration,
//       };
//     } catch (error) {
//       console.error(
//         "❌ Meeting creation error:",
//         error.response?.data || error.message
//       );
//       throw error;
//     }
//   }
// }

// // Test the setup
// async function testZoomIntegration() {
//   const scheduler = new ZoomScheduler();

//   // Create a test meeting for tomorrow at 2 PM
//   const tomorrow = new Date();
//   tomorrow.setDate(tomorrow.getDate() + 1);
//   tomorrow.setHours(14, 0, 0, 0);

//   const meetingDetails = {
//     topic: "Quick Test Meeting",
//     startTime: tomorrow.toISOString(),
//     duration: 30,
//     timezone: "UTC",
//   };

//   try {
//     const meeting = await scheduler.createMeeting(meetingDetails);

//     console.log("\n📅 Meeting Details:");
//     console.log(`Topic: ${meeting.topic}`);
//     console.log(`Start Time: ${meeting.startTime}`);
//     console.log(`Duration: ${meeting.duration} minutes`);
//     console.log(`\n🔗 Host Link: ${meeting.startUrl}`);
//     console.log(`🔗 Join Link: ${meeting.joinUrl}`);

//     return meeting;
//   } catch (error) {
//     console.error("Test failed:", error.message);
//   }
// }

// // Run the test
// if (require.main === module) {
//   testZoomIntegration();
// }

// module.exports = ZoomScheduler;

// zoom-scheduler-test.js
const axios = require("axios");
const schedule = require("node-schedule");
require("dotenv").config();

class ZoomScheduler {
  constructor() {
    this.accessToken = null;
    this.baseURL = "https://api.zoom.us/v2";
  }

  async getAccessToken() {
    const authString = Buffer.from(
      `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
    ).toString("base64");

    const response = await axios.post(
      "https://zoom.us/oauth/token",
      `grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
      {
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    this.accessToken = response.data.access_token;
    return this.accessToken;
  }

  async createMeeting(meetingDetails) {
    if (!this.accessToken) {
      await this.getAccessToken();
    }

    const meetingData = {
      topic: `${meetingDetails.subject} - Tutoring Session`,
      type: 2,
      start_time: meetingDetails.startTime,
      duration: meetingDetails.duration || 30,
      timezone: meetingDetails.timezone || "UTC",
      agenda: `Tutoring session for ${meetingDetails.subject}`,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
      },
    };

    const response = await axios.post(
      `${this.baseURL}/users/me/meetings`,
      meetingData,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      id: response.data.id,
      topic: response.data.topic,
      startUrl: response.data.start_url,
      joinUrl: response.data.join_url,
      startTime: response.data.start_time,
      duration: response.data.duration,
    };
  }
}

// ===== Reminder System with node-schedule =====
class ReminderSystem {
  constructor() {
    this.jobs = {};
  }

  scheduleReminder(datetime, recipients, content, jobId) {
    const job = schedule.scheduleJob(datetime, () => {
      console.log(`\n📧 Sending reminder: ${jobId}`);
      for (const r of recipients) {
        this.sendEmail(r, content);
      }
    });

    this.jobs[jobId] = job;
    console.log(`⏰ Scheduled ${jobId} at ${datetime.toISOString()}`);
  }

  sendEmail(recipient, content) {
    console.log(
      `✅ Email sent to ${recipient.email} | Subject: ${content.subject}`
    );
  }
}

// ===== Demo Runner =====
async function demo() {
  const zoom = new ZoomScheduler();
  const reminders = new ReminderSystem();

  // Pick a test time: 2 minutes from now (UTC+1)
  const now = new Date();
  const testTime = new Date(now.getTime() + 2 * 60 * 1000);

  // Force UTC+1 by adding offset
  const testTimeUTC1 = new Date(
    testTime.toLocaleString("en-US", { timeZone: "Europe/Berlin" }) // UTC+1 in winter, UTC+2 in summer
  );

  console.log("🕒 Now:", now.toISOString());
  console.log("🕒 Test reminder at (UTC+1):", testTimeUTC1.toISOString());

  // Fake meeting (skip actual Zoom call for testing)
  const meeting = {
    id: "123456",
    topic: "Math Tutoring Test",
    joinUrl: "https://zoom.us/j/123456",
    startTime: testTimeUTC1,
  };

  // Fake participants
  const participants = [
    { email: "student@example.com" },
    { email: "tutor@example.com" },
  ];

  // Schedule reminder at test time
  reminders.scheduleReminder(
    testTime,
    participants,
    {
      subject: `Reminder: ${meeting.topic}`,
      body: `Join here: ${meeting.joinUrl}`,
    },
    `${meeting.id}-test`
  );
}

if (require.main === module) {
  demo().catch(console.error);
}
