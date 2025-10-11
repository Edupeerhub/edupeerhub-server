const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  const TutorStat = sequelize.define(
    "TutorStat",
    {
      tutorId: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,

        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      totalCompletedSessions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalWeeklySessions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalStudents: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalHoursTaught: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },
      averageRating: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },
      totalReviews: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      lastUpdated: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      tableName: "tutor_stats",
      underscored: true,
      timestamps: false,
    }
  );

  TutorStat.associate = function (models) {
    TutorStat.belongsTo(models.Tutor, { foreignKey: "tutor_id", as: "tutor" });
    models.Tutor.hasOne(TutorStat, {
      foreignKey: "tutor_id",
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
