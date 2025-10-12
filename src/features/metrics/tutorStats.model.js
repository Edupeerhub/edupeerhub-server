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
        get() {
          return this.getDataValue("totalCompletedSessions") || 0;
        },
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
        type: DataTypes.DECIMAL(6, 1),
        allowNull: false,
        defaultValue: 0.0,
        get() {
          const value = this.getDataValue("totalHoursTaught");
          return value === null ? null : Math.round(value * 10) / 10;
        },
      },
      averageRating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: false,
        defaultValue: 0.0,
        get() {
          const value = this.getDataValue("averageRating");
          return value === null ? null : Math.round(value * 10) / 10;
        },
      },
      totalReviews: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      reviewBreakdown: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [
          { stars: 5, percent: 0 },
          { stars: 4, percent: 0 },
          { stars: 3, percent: 0 },
          { stars: 2, percent: 0 },
          { stars: 1, percent: 0 },
        ],
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
      // hooks: {
      //   beforeUpdate: async (tutorStat, options) => {
      //     const existingRecord = await TutorStat.findOne({
      //       where: {
      //         tutorId: tutorStat.tutorId,
      //       },
      //     });

      //     if (!existingRecord) {
      //       await TutorStat.create({ tutorId: tutorStat.tutorId });
      //     }
      //   },
      // },
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
        "reviewBreakdown",
      ],
    });
  };

  return TutorStat;
};
