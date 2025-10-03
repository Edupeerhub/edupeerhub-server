const sendResponse = require("@utils/sendResponse");
const UserService = require("./user.service");
const ApiError = require("@src/shared/utils/apiError");

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
    const requester = req.user;
    const targetId = req.params.id;

    if (requester.id !== targetId) {
      throw new ApiError("You're not allowed to update this profile", 403);
    }

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
