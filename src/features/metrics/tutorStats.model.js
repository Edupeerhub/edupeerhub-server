const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TutorStat = sequelize.define(
    "TutorStat",
    {
      tutorId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,

        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      totalCompletedSessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalWeeklySessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalStudents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalHoursTaught: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },
      averageRating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },
      totalReviews: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      lastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "tutor_stats",
      underscored: true,
      timestamps: false,
    }
  );

  TutorStat.associate = function (models) {
    TutorStat.belongsTo(models.Tutor, {
      foreignKey: "tutorId",
      as: "tutor",
    });

    models.Tutor.hasOne(TutorStat, {
      foreignKey: "tutorId",
      as: "stats",
    });

    TutorStat.addScope("join", {
      attributes: [
        "totalCompletedSessions",
        "totalStudents",
        "totalWeeklySessions",
        "totalHoursTaught",
        "averageRating",
        "totalReviews",
      ],
    });
  };

  return TutorStat;
};
