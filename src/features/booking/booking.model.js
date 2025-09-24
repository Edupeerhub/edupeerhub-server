const ApiError = require("@src/shared/utils/apiError");
const { DataTypes } = require("sequelize");
const { validate } = require("uuid");

module.exports = (sequelize) => {
  const Booking = sequelize.define(
    "Booking",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      tutorId: {
        type: DataTypes.UUID,
        allowNull: false,
        // references: {
        //   model: "tutors",
        //   as: "tutor",
        //   key: "id",
        // },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      studentId: {
        type: DataTypes.UUID,
        allowNull: true,
        // references: {
        //   model: "students",
        //   key: "id",
        // },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      subjectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "subjects",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      scheduledStart: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          isAfter: new Date().toISOString(),
        },
      },

      scheduledEnd: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          isAfterStart(value) {
            if (value <= this.scheduledStart) {
              throw new Error("Scheduled end must be after scheduled start");
            }
          },
        },
      },

      status: {
        type: DataTypes.ENUM(
          "open",
          "pending",
          "confirmed",
          "completed",
          "cancelled"
        ),
        allowNull: false,
        defaultValue: "open",
      },

      meetingLink: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },

      tutorNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      studentNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      cancelledBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      cancelledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      cancellationReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // hourlyRate: {
      //   type: DataTypes.DECIMAL(10, 2),
      //   allowNull: true,
      //   validate: {
      //     min: 0
      //   }
      // },

      // totalAmount: {
      //   type: DataTypes.DECIMAL(10, 2),
      //   allowNull: true,
      //   validate: {
      //     min: 0
      //   }
      // },

      // paymentStatus: {
      //   type: DataTypes.ENUM('pending', 'paid', 'refunded', 'failed'),
      //   allowNull: false,
      //   defaultValue: 'pending'
      // },

      isRecurring: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      recurringPattern: {
        type: DataTypes.JSON, // Store recurring pattern data
        allowNull: true,
      },

      parentBookingId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "bookings",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      reminderSent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      actualStartTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      actualEndTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // rating: {
      //   type: DataTypes.INTEGER,
      //   allowNull: true,
      //   validate: {
      //     min: 1,
      //     max: 5,
      //   },
      // },
    },
    {
      tableName: "bookings",
      timestamps: true,
      indexes: [
        {
          fields: ["tutorId"],
        },
        {
          fields: ["studentId"],
        },
        {
          fields: ["subjectId"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["scheduledStart"],
        },
        {
          fields: ["scheduledEnd"],
        },
        // {
        //   fields: ["paymentStatus"],
        // },
        {
          unique: false,
          fields: ["tutorId", "scheduledStart", "scheduledEnd"],
          name: "tutor_time_conflict_check",
        },
        {
          unique: false,
          fields: ["studentId", "scheduledStart", "scheduledEnd"],
          name: "student_time_conflict_check",
        },
      ],
      hooks: {
        // beforeCreate: async (booking, options) => {
        //   await validateTutorSubject(booking);
        // },
        beforeValidate: (booking, options) => {
          // Calculate total amount if hourly rate and duration are provided
          if (booking.hourlyRate && booking.duration) {
            booking.totalAmount = (
              (booking.hourlyRate * booking.duration) /
              60
            ).toFixed(2);
          }
        },

        beforeUpdate: async (booking, options) => {
          // Ensure cancellation fields are set when status is cancelled
          if (booking.status === "cancelled" && booking.changed("status")) {
            booking.cancelledAt = new Date().toISOString();
          }
          if (booking.changed("subjectId")) {
            await validateTutorSubject(booking);
          }
        },
      },
    }
  );

  const validateTutorSubject = async (booking) => {
    const tutorSubjects = (await booking.getTutor()).subjects;

    const tutorSubject = tutorSubjects.some((s) => s.id === booking.subjectId);
    if (!tutorSubject) {
      throw new ApiError("Subject not registered for this tutor", 400);
    }
  };

  // Define associations
  Booking.associate = (models) => {
    // Many-to-one relationships
    Booking.belongsTo(models.Tutor, {
      foreignKey: "tutorId",
      as: "tutor",
    });

    Booking.belongsTo(models.Student, {
      foreignKey: "studentId",
      as: "student",
    });

    Booking.belongsTo(models.Subject, {
      foreignKey: "subjectId",
      as: "subject",
    });
    models.Subject.hasMany(models.Booking, {
      foreignKey: "subjectId",
      as: "bookings",
    });

    // Self-referential relationship for recurring bookings
    Booking.belongsTo(models.Booking, {
      foreignKey: "parentBookingId",
      as: "parentBooking",
    });

    Booking.hasMany(models.Booking, {
      foreignKey: "parentBookingId",
      as: "childBookings",
    });

    // Polymorphic relationship for cancelledBy (could be tutor or student)
    Booking.belongsTo(models.User, {
      foreignKey: "cancelledBy",
      as: "cancelledByUser",
    });

    Booking.addScope("join", {
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "isRecurring",
          "recurringPattern",
          "parentBookingId",
          "tutorId",
          "studentId",
          "subjectId",
        ],
      },
      include: [
        {
          model: models.Tutor.unscoped(),
          as: "tutor",
          attributes: {
            exclude: [
              "userId",
              "createdAt",
              "updatedAt",
              "approvalStatus",
              "rejectionReason",
            ],
          },
          include: [
            {
              model: models.User.unscoped(),
              as: "user",
              attributes: [
                "email",
                "id",
                "firstName",
                "lastName",
                "profileImageUrl",
              ],
            },
            {
              model: models.Subject.scope("join"),
              as: "subjects",
            },
          ],
        },
        {
          model: models.Student.unscoped(),
          as: "student",
          attributes: {
            exclude: ["createdAt", "gradeLevel", "updatedAt", "userId"],
          },
          include: [
            {
              model: models.User.unscoped(),
              as: "user",
              attributes: [
                "email",
                "id",
                "firstName",
                "lastName",
                "profileImageUrl",
              ],
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

  // Instance methods
  Booking.prototype.canBeCancelled = function () {
    const now = new Date();
    const scheduledStart = new Date(this.scheduledStart);
    const hoursUntilStart = (scheduledStart - now) / (1000 * 60 * 60);

    return (
      this.status !== "completed" &&
      this.status !== "cancelled" &&
      hoursUntilStart > 2
    ); // Can only cancel 2+ hours before start
  };

  Booking.prototype.isUpcoming = function () {
    const now = new Date();
    return new Date(this.scheduledStart) > now && this.status === "confirmed";
  };

  Booking.prototype.getDurationInMinutes = function () {
    const start = new Date(this.scheduledStart);
    const end = new Date(this.scheduledEnd);
    return Math.round((end - start) / (1000 * 60));
  };

  return Booking;
};
