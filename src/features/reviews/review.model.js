const sequelize = require("@src/shared/database/index");
const { DataTypes } = require("sequelize");

module.exports = () => {
  const Review = sequelize.define(
    "Review",
    {
      id: {
        type: DataTypes.INTEGER,
        defaultValue: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      reviewerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      revieweeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      sessionId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "session_id",
      },
      // Numerical rating (e.g., 1-5)
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      // Textual feedback
      comment: {
        type: DataTypes.TEXT,
        allowNull: true, // Comment can be optional
      },
      // Type of review to differentiate flows
      type: {
        type: DataTypes.ENUM(
          "tutor_to_student",
          "student_to_tutor",
          "session_feedback"
        ),
        allowNull: false,
      },
    },
    {
      tableName: "reviews",
      underscored: true,
      timestamps: true,
      paranoid: true,
      defaultScope: {
        where: { deleted_at: null },
      },
    }
  );

  Review.associate = (models) => {
    // A review is written by a user (reviewer)
    Review.belongsTo(models.User, {
      foreignKey: "reviewerId",
      as: "reviewer",
    });

    // A review is for a user (reviewee)
    Review.belongsTo(models.User, {
      foreignKey: "revieweeId",
      as: "reviewee",
    });

    // Associated session/booking
    Review.belongsTo(models.Booking, {
      foreignKey: "sessionId",
      as: "session",
    });
  };

  return Review;
};
