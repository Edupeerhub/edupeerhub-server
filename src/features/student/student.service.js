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
    if (!userId) {
      throw new ApiError("User id required", 400);
    }
    const payload = data || {};
    const existing = await Student.findByPk(userId);
    if (existing) {
      throw new ApiError("Student profile already exists", 409);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // normalize learningGoals to array of strings
    let goals = [];
    if (Array.isArray(payload.learningGoals)) {
      goals = payload.learningGoals.map((g) =>
        typeof g === "string" ? g : g.title
      );
    }

    const student = await Student.create({
      userId,
      gradeLevel: payload.gradeLevel,
      learningGoals: JSON.stringify(goals),
    });

    // mark user as onboarded
    try {
      await user.update({ isOnboarded: true });
    } catch (err) {
      // don't fail onboarding if updating user flag fails; log and continue
      console.error("Failed to set user.isOnboarded:", err.message || err);
    }

    if (payload.subjects) {
      await student.setSubjects(payload.subjects);
    }
    if (payload.exams) {
      await student.setExams(payload.exams);
    }

    return this.getStudentById(userId);
  },

  async getUserById(userId) {
    const user = await User.findByPk(userId, {
      attributes: ["id", "role", "firstName", "lastName", "email"],
    });
    if (!user) {
      return null;
    }
    return user.toJSON();
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
      const goals = Array.isArray(payload.learningGoals)
        ? payload.learningGoals.map((g) =>
            typeof g === "string" ? g : g.title
          )
        : [];
      student.learningGoals = JSON.stringify(goals);
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

  async deleteStudent(id) {
    const student = await Student.findByPk(id);
    if (!student) {
      throw new ApiError("Student not found", 404);
    }
    await student.setSubjects([]);
    await student.setExams([]);
    await student.destroy();
    return { id };
  },
};
