const ApiError = require("@utils/apiError");
const { User } = require("@models");

class UserService {
  static async fetchProfile(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return user;
  }
  static async fetchFullProfile(userId) {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: User.sequelize.models.Student,
          as: "student",
          include: [
            { model: User.sequelize.models.Subject, as: "subjects" },
            // { model: User.sequelize.models.Booking, as: "bookings" },
          ],
        },
        {
          model: User.sequelize.models.Tutor,
          as: "tutor",
          include: [
            { model: User.sequelize.models.Subject, as: "subjects" },
            // { model: User.sequelize.models.Booking, as: "bookings" },
          ],
        },

        { model: User.sequelize.models.Admin, as: "admin" },
      ],
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const userProfile = user.toJSON();

    // Remove empty role objects
    if (!userProfile.student) delete userProfile.student;
    if (!userProfile.tutor) delete userProfile.tutor;
    if (!userProfile.admin) delete userProfile.admin;

    return userProfile;
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
