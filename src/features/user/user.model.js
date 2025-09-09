const userAuthPlugin = require("./userAuth.plugin");
const authHelpers = require("@utils/authHelpers");
const sequelize = require("@src/shared/database/index");
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
        allowNull: true,
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
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "users",
      underscored: true,
      timestamps: true,
      paranoid: true,

      defaultScope: {
        attributes: {
          exclude: [
            "passwordHash",
            "verificationToken",
            "resetPasswordToken",
            "verificationTokenExpiresAt",
            "resetPasswordExpiresAt",
          ],
        },
      },
      scopes: {
        includeDeleted: {
          attributes: {
            exclude: [
              "passwordHash",
              "verificationToken",
              "resetPasswordToken",
              "verificationTokenExpiresAt",
              "resetPasswordExpiresAt",
            ],
          },
          paranoid: false,
        },
        active: {
          where: {
            accountStatus: "active",
          },
        },
        verified: {
          where: {
            isVerified: true,
          },
        },
        join: {
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "profileImageUrl",
            "role",
          ],
        },
      },
      hooks: {
        beforeCreate: async (user, options) => {
          user.passwordHash = await authHelpers.hashPassword(user.passwordHash);
        },
        beforeUpdate: async (user, options) => {
          if (user.changed("passwordHash")) {
            user.passwordHash = await authHelpers.hashPassword(
              user.passwordHash
            );
          }
        },
      },
      indexes: [
        { fields: ["email"] },
        { fields: ["role"] },
        { fields: ["account_status"] },
        { fields: ["is_verified"] },
        { fields: ["verification_token"] },
        { fields: ["reset_password_token"] },
        { fields: ["created_at"] },
      ],
    }
  );

  userAuthPlugin(User);

  User.associate = (models) => {
    User.hasOne(models.Student, {
      foreignKey: "userId",
      as: "student",
      // scope: "join",
    });
    User.hasOne(models.Tutor, { foreignKey: "userId", as: "tutor" });
    User.hasOne(models.Admin, { foreignKey: "userId", as: "admin" });
  };

  return User;
};
