const sendResponse = require("@utils/sendResponse");
const studentService = require("./student.service");
const ApiError = require("@src/shared/utils/apiError");

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
      if (!student) {
        throw new ApiError("Student not found", 404);
      }
      sendResponse(res, 200, "Student fetched", student);
    } catch (err) {
      next(err);
    }
  },

  async onboarding(req, res, next) {
    try {
      // const requester = req.user;
      // const targetId = req.params.id;

      // // Only check if requester can onboard this specific profile
      // if (requester.id !== targetId) {
      //   return res.status(403).json({ message: "Students can only onboard their own profile" });
      // }

      // const payload = req.body;
      // // This check might be redundant if validate middleware ensures body exists
      // if (!payload || typeof payload !== "object") {
      //   return res.status(400).json({ message: "Request body required" });
      // }

      const student = await studentService.createStudentForUser(
        req.user.id,
        req.body
      );
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
        throw new ApiError("Forbidden", 403);
      }

      const student = await studentService.updateStudent(targetId, req.body);
      sendResponse(res, 200, "Student updated", student);
    } catch (err) {
      next(err);
    }
  },

  async deleteStudent(req, res, next) {
    try {
      const requester = req.user;
      const targetId = req.params.id;
      if (!requester) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (requester.role !== "admin" || !targetId) {
        return res
          .status(403)
          .json({ message: "Only Students and Admins can delete accounts" });
      }

      const result = await studentService.deleteStudent(req.params.id);
      sendResponse(res, 200, "Student deleted", result);
    } catch (err) {
      next(err);
    }
  },
};
