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

  static async deleteUser(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    await user.destroy();
  }
}

module.exports = UserService;
