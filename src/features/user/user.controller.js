const sendResponse = require("@utils/sendResponse");
const UserService = require("./user.service");

exports.profile = async (req, res, next) => {
  try {
    const user = await UserService.fetchFullProfile(req.user.id, req.user.role);

    sendResponse(res, 200, "Profile fetch successful", user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const targetId = req.params.id;

    const fileData = req.file
      ? {
          profileImageUrl: req.file.path,
          profileImagePublicId: req.file.filename,
        }
      : {};

    const updatedUser = await UserService.updateUser(targetId, {
      ...req.body,
      ...fileData,
    });

    sendResponse(res, 200, "Profile updated successfully", updatedUser);
  } catch (error) {
    next(error);
  }
};

// exports.profile = async (req, res, next) => {
//   try {
//     const user = await UserService.fetchProfile(req.user.id);
//     sendResponse(res, 200, "Profile fetch successful", user);
//   } catch (error) {
//     next(error);
//   }
// };

exports.deleteUser = async (req, res, next) => {
  try {
    await UserService.deleteUser(req.user.id);
    sendResponse(res, 200, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};
