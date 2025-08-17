const sendResponse = require("../../shared/utils/sendResponse");
const { status } = require("http-status");
//availability validator

exports.availabilityValidator = async (req, res, next) => {
  next();
};

//tutor profile validator
exports.profileValidator = async (req, res, next) => {
  next();
};

exports.canEditProfileValidator = async (req, res, next) => {
  const userId = req.user.id;
  const profileId = req.path.id;
  //own profile

  if (userId === profileId) {
    next();
    return;
  }

  //admin role
  if (req.user.role === "admin" || req.user.role === "superadmin") {
    next();
    return;
  }

  sendResponse(res, status.FORBIDDEN, status["403_NAME"], );
};
//tutor search validator
exports.searchValidator = async (req, res, next) => {
  next();
};

//tutor schedule search validator
exports.scheduleSearchValidator = async (req, res, next) => {
  next();
};
