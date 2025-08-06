const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ApiError = require("../../shared/utils/apiError");

function userAuthPlugin(model) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new ApiError("JWT secret is not defined in environment variables");
  }

  // Instance Methods
  model.prototype.generateAuthToken = function () {
    return jwt.sign(
      {
        id: this.id,
        email: this.email,
        role: this.role,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );
  };

  model.prototype.isValidPassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
  };
}

module.exports = userAuthPlugin;
