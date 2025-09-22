// services/CallService.js
const { StreamChat } = require("stream-chat");
const {
  generateDmChannelId,
} = require("../../shared/utils/generateDmChannelId");
// const EmailService = require("./EmailService"); // your existing email service

const STREAM_API_KEY = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

const client = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);

class CallService {
  constructor() {
    // this.emailService = new EmailService();
  }

  /**
   * Sends a call invite to both participants and creates the channel if needed
   * @param {Object} session - session/booking object
   * @param {String} type - e.g., 'Reminder' or 'Immediate'
   */
  async getCallInvite(session, type) {
    const { tutorId, tutorEmail, studentId, studentEmail } = session;

    // Generate deterministic DM channel ID
    const channelId = generateDmChannelId(tutorId, studentId);

    // Create or retrieve the channel
    const channel = client.channel("messaging", channelId, {
      members: [tutorId, studentId],
    });
    await channel.create();

    // Generate call URL
    const callUrl = `${FRONTEND_URL}/chat/${studentId}`;

    console.log(`✅ Sent ${type} invite for session ${session.id}`);
    return { channelId, callUrl };
  }
}

module.exports = CallService;
