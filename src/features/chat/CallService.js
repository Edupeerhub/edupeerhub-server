const CLIENT_URL = process.env.CLIENT_URL;

class CallService {
  /**
   * Returns tutor + student call URLs for a session
   * @param {Object} session - booking/session object
   * @returns {{ tutorCallUrl: string, studentCallUrl: string }}
   */
  async getCallLinks(session) {
    return {
      tutorCallUrl: `${CLIENT_URL}/tutor/call/${session.id}`,
      studentCallUrl: `${CLIENT_URL}/student/call/${session.id}`,
    };
  }
}

module.exports = CallService;
