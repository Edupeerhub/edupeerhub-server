const userAuthPlugin = require("./userAuth.plugin");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profileImageUrl: {
        type: DataTypes.TEXT,
      },
      role: {
        type: DataTypes.ENUM("admin", "tutor", "student"),
        allowNull: false,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isOnboarded: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      lastLogin: {
        type: DataTypes.DATE,
      },
      // Account status fields
      accountStatus: {
        type: DataTypes.ENUM("active", "suspended"),
        defaultValue: "active",
        allowNull: false,
      },
      suspendedAt: {
        type: DataTypes.DATE,
      },
      suspensionReason: {
        type: DataTypes.STRING,
      },
      // Email verification fields
      verificationToken: {
        type: DataTypes.TEXT,
      },
      verificationTokenExpiresAt: {
        type: DataTypes.DATE,
      },
      // Password reset fields
      resetPasswordToken: {
        type: DataTypes.TEXT,
      },
      resetPasswordExpiresAt: {
        type: DataTypes.DATE,
      },
      // Soft delete fields
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "users",
      underscored: true,
    }
  );

  userAuthPlugin(User, {
    passwordField: "passwordHash",
    saltRounds: 12,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: "7d",
  });

  User.associate = (models) => {
    User.hasOne(models.Student, { foreignKey: "user_id", as: "student" });
    User.hasOne(models.Tutor, { foreignKey: "user_id", as: "tutor" });
    User.hasOne(models.Admin, { foreignKey: "user_id", as: "admin" });
  };

  return User;
};
