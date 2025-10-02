const sendResponse = require("@utils/sendResponse");
const studentService = require("./student.service");
const ApiError = require("@src/shared/utils/apiError");
const trackEvent = require("../events/events.service");
const eventTypes = require("../events/eventTypes");
const { addStreamUser } = require("../auth/auth.service");

module.exports = {
  async listStudents(req, res, next) {
    try {
      const page = req.query?.page;
      const limit = req.query?.limit;
      const students = await studentService.listStudents({
        page,
        limit,
      });
      sendResponse(res, 200, "Students list fetched", students);
    } catch (err) {
      next(err);
    }
  },

  async getStudent(req, res, next) {
    try {
      const student = await studentService.getStudentById(req.params.id);

      sendResponse(res, 200, "Student fetched", student);
    } catch (err) {
      next(err);
    }
  },

  async onboarding(req, res, next) {
    try {
      const student = await studentService.createStudentForUser(
        req.user.id,
        req.body
      );

      await addStreamUser({
        id: student.userId,
        email: student.user.email,
        role: student.user.role,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
      });

      await trackEvent(eventTypes.USER_ONBOARDED, {
        userId: student.userId,
        email: student.user.email,
        role: student.user.role,
        fullName: `${student.user.firstName} ${student.user.lastName}`,
      });
      sendResponse(res, 201, "Onboarding successful", student);
    } catch (err) {
      next(err);
    }
  },

  async updateStudent(req, res, next) {
    try {
      const requester = req.user;
      const targetId = req.params.id;

      if (requester.role !== "admin" && requester.id !== targetId) {
        throw new ApiError("You're not allowed to update this profile", 403);
      }

      const student = await studentService.updateStudent(targetId, req.body);
      await addStreamUser({
        id: student.userId,
        email: student.user.email,
        role: student.user.role,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
      });
      sendResponse(res, 200, "Student updated", student);
    } catch (err) {
      next(err);
    }
  },
};
