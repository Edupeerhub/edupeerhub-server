const jwt = require("jsonwebtoken");
const { User } = require("@src/shared/database/models");
const ApiError = require("@utils/apiError");

exports.protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      throw new ApiError("Unauthorized - No token provided", 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new ApiError("Unauthorized - Token expired", 401);
      }
      throw new ApiError("Unauthorized - Invalid token", 401);
    }

    const user = await User.findByPk(decoded.id, {
      attributes: [
        "id",
        "email",
        "isVerified",
        "isOnboarded",
        "role",
        "accountStatus",
        "deletedAt",
      ],
    });

    if (!user) throw new ApiError("Unauthorized", 401);

    if (user.deletedAt) throw new ApiError("Account no longer exists", 403);

    if (user.accountStatus === "suspended")
      throw new ApiError("Your account is suspended", 403);

    req.user = user;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(error.message, 401));
  }
};

exports.requireVerifiedAndOnboardedUser = (req, res, next) => {
  if (!req.user.isVerified) {
    throw new ApiError("Please verify your email to access this resource", 403);
  }

  if (!req.user.isOnboarded) {
    throw new ApiError(
      "Please complete onboarding to access this resource",
      403
    );
  }

  next();
};

exports.requireVerifiedUser = (req, res, next) => {
  if (!req.user.isVerified) {
    throw new ApiError("Please verify your email to access this resource", 403);
  }

  next();
};

exports.requireStudentRole = (req, res, next) => {
  if (req.user.role !== "student") {
    throw new ApiError("Access denied - Student only", 403);
  }
  next();
};

exports.requireTutorRole = (req, res, next) => {
  if (req.user.role !== "tutor") {
    throw new ApiError("Access denied - Tutor only", 403);
  }
  next();
};
