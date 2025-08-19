const sequelize = require("../../shared/database/index");
const { DataTypes } = require("sequelize");

module.exports = () => {
  const Tutor = sequelize.define(
    "Tutor",
    {
      userId: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      approvalStatus: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
        allowNull: false,
      },
      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      profileVisibility: {
        type: DataTypes.ENUM("active", "hidden"),
        defaultValue: "active",
        allowNull: false,
      },
      education: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      timezone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "tutor_profiles",
      underscored: true,
    }
  );

  Tutor.associate = (models) => {
    Tutor.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    Tutor.belongsToMany(models.Subject, {
      through: "tutor_subjects",
      as: "subjects",
      // otherKey: "subjectId",
      // uniqueKey: "userId",
    });
  };

  return Tutor;
};
