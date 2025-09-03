const sequelize = require("@src/shared/database/index");
const DataTypes = require("sequelize");

module.exports = () => {
  const Tutor = sequelize.define(
    "Tutor",
    {
      userId: {
        type: DataTypes.UUID,
        primaryKey: true,
        field: "user_id",
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
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
        defaultValue: "hidden",
        allowNull: false,
      },
      education: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      timezone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "tutor_profiles",
      underscored: true,
      defaultScope: {
        include: [
          {
            model: sequelize.models.Subject,
            through: { attributes: [] },
            as: "subjects",
          },
        ],
      },
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
    });
  };

  return Tutor;
};
