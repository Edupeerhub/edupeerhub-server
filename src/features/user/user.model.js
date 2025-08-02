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
      emailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      verificationToken: {
        type: DataTypes.TEXT,
      },
      verificationTokenExpiresAt: {
        type: DataTypes.DATE,
      },
      resetPasswordToken: {
        type: DataTypes.TEXT,
      },
      resetPasswordExpiresAt: {
        type: DataTypes.DATE,
      },
      lastLogin: {
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
