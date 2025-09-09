const ApiError = require("@utils/apiError");
const { User, Student, Subject, Exam } = require("@models");
const { where, Op } = require("sequelize");

module.exports = {
  // get all
  async listStudents({ limit = 10, page = 1 }) {
    return await Student.scope("join").findAndCountAll({
      limit: limit,

      offset: (page - 1) * limit,
    });
  },
  // get one
  async getStudentById(id) {
    const student = await Student.scope("join").findByPk(id, {});
    if (!student) {
      throw new ApiError("Student does not exist", 404);
    }
    return student;
  },
  // onboarding
  async createStudentForUser(userId, data) {
    const user = await User.findByPk(userId);

    const payload = data || {};
    const existing = await Student.findByPk(userId);
    if (existing) {
      throw new ApiError("Student profile already exists", 409);
    }

    await user.update({ isOnboarded: true, role: "student" });

    const student = await Student.create({
      userId,
      gradeLevel: payload.gradeLevel,
      learningGoals: payload.learningGoals,
    });

    if (payload.subjects) {
      await student.setSubjects(payload.subjects);
    }
    if (payload.exams) {
      await student.setExams(payload.exams);
    }

    return this.getStudentById(userId);
  },

  // update user
  async updateStudent(id, data) {
    const payload = data || {};
    const student = await Student.findByPk(id);

    if (!student) {
      throw new ApiError("Student not found", 404);
    }

    if (payload.gradeLevel) {
      student.gradeLevel = payload.gradeLevel;
    }
    if (payload.learningGoals) {
      student.learningGoals = payload.learningGoals;
    }
    if (typeof payload.isOnboarded === "boolean") {
      student.isOnboarded = payload.isOnboarded;
    }

    await student.save();

    // ensure user is marked onboarded after profile update
    // try {
    //   const userId = student.userId || student.id;
    //   const user = await User.findByPk(userId);
    //   if (user && !user.isOnboarded) {
    //     await user.update({ isOnboarded: true });
    //   }
    // } catch (err) {
    //   console.error(
    //     "Failed to set user.isOnboarded on update:",
    //     err.message || err
    //   );
    // }

    if (payload.subjects) {
      await student.setSubjects(payload.subjects);
    }
    if (payload.exams) {
      await student.setExams(payload.exams);
    }

    return this.getStudentById(student.userId || student.id);
  },
};
