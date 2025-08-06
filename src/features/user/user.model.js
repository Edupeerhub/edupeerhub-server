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
        allowNull: false,
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
        allowNull: true,
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
      defaultScope: {
        attributes: {
          exclude: [
            "password_hash",
            "verification_token",
            "reset_password_token",
          ],
        },
        where: {
          is_deleted: false,
        },
      },
      scopes: {
        includeDeleted: {
          where: {},
        },
        active: {
          where: {
            account_status: "active",
            is_deleted: false,
          },
        },
        verified: {
          where: {
            is_verified: true,
            is_deleted: false,
          },
        },
      },
      indexes: [
        { fields: ["email"] },
        { fields: ["role"] },
        { fields: ["account_status"] },
        { fields: ["is_verified"] },
        { fields: ["is_deleted"] },
        { fields: ["verification_token"] },
        { fields: ["reset_password_token"] },
        { fields: ["created_at"] },
      ],
    }
  );

  userAuthPlugin(User);

  User.associate = (models) => {
    User.hasOne(models.Student, { foreignKey: "user_id", as: "student" });
    User.hasOne(models.Tutor, { foreignKey: "user_id", as: "tutor" });
    User.hasOne(models.Admin, { foreignKey: "user_id", as: "admin" });
  };

  return User;
};
