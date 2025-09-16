const sequelize = require("@src/shared/database/index");
const { DataTypes } = require("sequelize");

module.exports = () => {
  const Session = sequelize.define(
    "Session",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "student_id",
        references: {
          model: "student_profiles",
          key: "user_id",
        },
      },
      tutorId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "tutor_id",
        references: {
          model: "tutor_profiles",
          key: "user_id",
        },
      },
      subjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "subject_id",
        references: {
          model: "subjects",
          key: "id",
        },
      },
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "scheduled_at",
      },
      duration: {
        type: DataTypes.INTEGER, // Duration in minutes
        defaultValue: 60,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "scheduled",
          "confirmed",
          "in_progress", 
          "completed",
          "cancelled",
          "no_show"
        ),
        defaultValue: "scheduled",
        allowNull: false,
      },
      meetingUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "meeting_url",
      },
      meetingId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "meeting_id",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      cancellationReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "cancellation_reason",
      },
      remindersSent: {
        type: DataTypes.JSONB,
        defaultValue: {
          "24_hours": false,
          "1_hour": false,
          "15_minutes": false,
        },
        field: "reminders_sent",
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "completed_at",
      },
      cancelledAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "cancelled_at",
      },
    },
    {
      tableName: "sessions",
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ["student_id"] },
        { fields: ["tutor_id"] },
        { fields: ["subject_id"] },
        { fields: ["scheduled_at"] },
        { fields: ["status"] },
        { fields: ["created_at"] },
      ],
      scopes: {
        upcoming: {
          where: {
            scheduledAt: {
              [DataTypes.Op.gte]: new Date(),
            },
            status: ["scheduled", "confirmed"],
          },
        },
        active: {
          where: {
            status: ["scheduled", "confirmed", "in_progress"],
          },
        },
      },
    }
  );

  Session.associate = (models) => {
    Session.belongsTo(models.Student, {
      foreignKey: "studentId",
      as: "student",
    });

    Session.belongsTo(models.Tutor, {
      foreignKey: "tutorId", 
      as: "tutor",
    });

    Session.belongsTo(models.Subject, {
      foreignKey: "subjectId",
      as: "subject",
    });

    // Add scope with associations
    Session.addScope("withDetails", {
      include: [
        {
          model: models.Student,
          as: "student",
          include: [
            {
              model: models.User.scope("join"),
              as: "user",
            },
          ],
        },
        {
          model: models.Tutor,
          as: "tutor",
          include: [
            {
              model: models.User.scope("join"),
              as: "user",
            },
          ],
        },
        {
          model: models.Subject.scope("join"),
          as: "subject",
        },
      ],
    });
  };

  return Session;
};