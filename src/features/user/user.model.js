const userAuthPlugin = require("./userAuth.plugin");
const sequelize = require("../../shared/database/index");
const { DataTypes } = require("sequelize");
module.exports = () => {
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
      timestamps: true,
      defaultScope: {
        attributes: {
          exclude: ["passwordHash", "verificationToken", "resetPasswordToken"],
        },
        where: {
          isDeleted: false,
        },
      },
      scopes: {
        includeDeleted: {
          attributes: {
            exclude: [
              "passwordHash",
              "verificationToken",
              "resetPasswordToken",
            ],
          },
          where: {},
        },
        active: {
          where: {
            accountStatus: "active",
            isDeleted: false,
          },
        },
        verified: {
          where: {
            isVerified: true,
            isDeleted: false,
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
