const { Admin } = require("@models");
const ApiError = require("@utils/apiError");

exports.requireAdmin = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ApiError("Access denied - Admins only", 403));
  }
  next();
};

exports.requireSuperAdmin = async (req, res, next) => {
  const adminProfile = await Admin.findOne({
    where: { userId: req.user.id },
    attributes: ["isSuperAdmin"],
  });

  if (!adminProfile.isSuperAdmin) {
    return next(new ApiError("Access denied - Super Admins only", 403));
  }

  next();
};
