const sendResponse = require("@utils/sendResponse");
const UserService = require("./user.service");

exports.profile = async (req, res, next) => {
  try {
    const user = await UserService.fetchProfile(req.user.id);
    sendResponse(res, 200, "Profile fetch successful", user);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await UserService.deleteUser(req.user.id);
    sendResponse(res, 200, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};
