module.exports = (sequelize, DataTypes) => {
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
    Tutor.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  };

  return Tutor;
};
