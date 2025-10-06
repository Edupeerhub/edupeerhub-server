const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  const TutorStat = sequelize.define("TutorStat", {
    tutor_id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "tutor_profiles",
        key: "user_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    total_completed_sessions: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_weekly_sessions: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_hours_taught: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    average_rating: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    total_reviews: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    last_updated: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  }, {
    tableName: "tutor_stats",
    underscored: true,
    timestamps: false,
  });

  TutorStat.associate = function (models) {
    TutorStat.belongsTo(models.Tutor, { foreignKey: "tutor_id", as: "tutor" });
    models.Tutor.hasOne(TutorStat, {
      foreignKey: "tutor_id",
      as: "stats",
    });

    TutorStat.addScope("join", {
      attributes: [
        "total_completed_sessions",
        "total_weekly_sessions",
        "total_hours_taught",
        "average_rating",
        "total_reviews",
      ],
      
    });
  };

  return TutorStat;
};
