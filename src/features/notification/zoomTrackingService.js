const express = require("express");
const bodyParser = require("body-parser");
const { EventLog } = require("@models");
const ApiError = require("@utils/apiError");

class ZoomTrackingService {
  constructor() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.registerRoutes();
  }

  registerRoutes() {
    // Zoom will POST webhook events here
    this.app.post("/zoom/webhook", async (req, res) => {
      try {
        const { event, payload } = req.body;

        switch (event) {
          case "meeting.started":
            await this.handleMeetingStarted(payload.object);
            break;

          case "meeting.ended":
            await this.handleMeetingEnded(payload.object);
            break;

          case "participant.joined":
            await this.handleParticipantJoined(payload.object);
            break;

          case "participant.left":
            await this.handleParticipantLeft(payload.object);
            break;

          default:
            console.log("Unhandled Zoom event:", event);
        }

        res.status(200).send("ok");
      } catch (err) {
        console.error("Error processing Zoom webhook:", err);
        res.status(500).send("error");
      }
    });
  }

  // Meeting started
  async handleMeetingStarted(meeting) {
    await EventLog.create({
      eventType: "session_started",
      details: {
        session_id: meeting.id,
        host_id: meeting.host_id,
        started_at: meeting.start_time,
      },
    });
  }

  // Meeting ended
  async handleMeetingEnded(meeting) {
    await EventLog.create({
      eventType: "session_completed",
      details: {
        session_id: meeting.id,
        host_id: meeting.host_id,
        ended_at: meeting.end_time,
        duration_secs: meeting.duration * 60, // Zoom duration in minutes
      },
    });
  }

  // Participant joined
  async handleParticipantJoined(participant) {
    await EventLog.create({
      eventType: "participant_joined",
      details: {
        session_id: participant.meeting_id,
        user_id: participant.user_id,
        joined_at: participant.join_time,
      },
    });
  }

  // Participant left
  async handleParticipantLeft(participant) {
    await EventLog.create({
      eventType: "participant_left",
      details: {
        session_id: participant.meeting_id,
        user_id: participant.user_id,
        left_at: participant.leave_time,
      },
    });
  }

  start(port = 3000) {
    this.app.listen(port, () => {
      console.log(`ZoomTrackingService running on port ${port}`);
    });
  }
}

module.exports = ZoomTrackingService;
