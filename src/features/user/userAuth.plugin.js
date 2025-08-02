const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Auth Plugin for Sequelize Models
function userAuthPlugin(model, options = {}) {
  const {
    passwordField = "passwordHash",
    saltRounds = 12,
    jwtSecret = process.env.JWT_SECRET,
    jwtExpiresIn = "7d",
    refreshSecret = process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn = "30d",
  } = options;

  // Add hooks
  model.addHook("beforeSave", async (instance) => {
    if (instance.changed(passwordField) || instance.isNewRecord) {
      if (instance[passwordField]) {
        const salt = await bcrypt.genSalt(saltRounds);
        instance[passwordField] = await bcrypt.hash(
          instance[passwordField],
          salt
        );
      }
    }
  });

  // Add verification token hook for new users
  model.addHook("beforeCreate", async (instance) => {
    if (!instance.verificationToken) {
      instance.verificationToken = crypto.randomBytes(32).toString("hex");
      instance.verificationTokenExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      );
    }
  });

  // Instance Methods
  model.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this[passwordField]);
  };

  model.prototype.generateAuthToken = function (expiresIn = jwtExpiresIn) {
    return jwt.sign(
      {
        id: this.id,
        email: this.email,
        role: this.role,
      },
      jwtSecret,
      { expiresIn }
    );
  };

  model.prototype.generateRefreshToken = function () {
    return jwt.sign({ id: this.id }, refreshSecret, {
      expiresIn: refreshExpiresIn,
    });
  };

  model.prototype.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.resetPasswordExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    return resetToken;
  };

  model.prototype.generateEmailVerificationToken = function () {
    const verificationToken = crypto.randomBytes(32).toString("hex");
    this.verificationToken = verificationToken;
    this.verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );
    return verificationToken;
  };

  model.prototype.isValidPassword = async function (userPassword) {
    return this.comparePassword(userPassword);
  };

  // Override toJSON to exclude sensitive fields
  const originalToJSON = model.prototype.toJSON;
  model.prototype.toJSON = function () {
    const values = originalToJSON.call(this);
    delete values[passwordField];
    delete values.verificationToken;
    delete values.resetPasswordToken;
    return values;
  };
}

module.exports = userAuthPlugin;
