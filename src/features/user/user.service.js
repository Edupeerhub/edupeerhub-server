const ApiError = require("@utils/apiError");
const { User, Student, Tutor, Subject, Admin } = require("@models");
const { getProfilePicUrls } = require("@src/shared/utils/cloudinaryHelper");

class UserService {
  static async fetchProfile(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return user;
  }

  static async fetchFullProfile(userId, role) {
    const includes = [];

    if (role === "student") {
      includes.push({
        model: User.sequelize.models.Student,
        as: "student",
        include: [
          { model: User.sequelize.models.Subject, as: "subjects" },
          {
            model: User.sequelize.models.Exam,
            as: "exams",
          },
        ],
      });
    }

    if (role === "tutor") {
      includes.push({
        model: User.sequelize.models.Tutor,
        as: "tutor",
        include: [{ model: User.sequelize.models.Subject, as: "subjects" }],
      });
    }

    if (role === "admin") {
      includes.push({
        model: User.sequelize.models.Admin,
        as: "admin",
      });
    }

    const user = await User.findByPk(userId, { include: includes });

    if (!user) throw new ApiError("User not found", 404);

    const userObj = user.toJSON();
    delete userObj.profileImagePublicId;

    userObj.profilePicVariants = getProfilePicUrls(user.profileImagePublicId);

    return userObj;
  }

  static async updateUser(userId, data) {
    const user = await User.findByPk(userId, {
      attributes: { include: ["profileImagePublicId"] },
    });
    if (!user) throw new ApiError("User not found", 404);

    if (data.firstName) user.firstName = data.firstName;
    if (data.lastName) user.lastName = data.lastName;
    if (data.profileImageUrl) user.profileImageUrl = data.profileImageUrl;
    if (data.profileImagePublicId)
      user.profileImagePublicId = data.profileImagePublicId;

    await user.save();

    // Role-specific updates
    // if (user.role === "student") {
    //   const student = await Student.findByPk(userId);
    //   if (student) {
    //     if (data.gradeLevel) student.gradeLevel = data.gradeLevel;
    //     if (data.learningGoals) student.learningGoals = data.learningGoals;
    //     if (typeof data.isOnboarded === "boolean")
    //       student.isOnboarded = data.isOnboarded;
    //     if (data.subjects) await student.setSubjects(data.subjects);
    //     if (data.exams) await student.setExams(data.exams);

    //     await student.save();
    //   }
    // }

    // if (user.role === "tutor") {
    //   const tutor = await Tutor.findByPk(userId);
    //   if (tutor) {
    //     if (data.bio) tutor.bio = data.bio;
    //     if (data.education) tutor.education = data.education;
    //     if (data.timezone) tutor.timezone = data.timezone;
    //     if (data.subjects) await tutor.setSubjects(data.subjects);

    //     await tutor.save();
    //   }
    // }

    // Return user with associated profile

    const userObj = user.toJSON();

    delete userObj.profileImagePublicId;
    userObj.profilePicVariants = getProfilePicUrls(user.profileImagePublicId);

    return userObj;
  }

  static async deleteUser(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    await user.destroy();
  }
}

module.exports = UserService;
