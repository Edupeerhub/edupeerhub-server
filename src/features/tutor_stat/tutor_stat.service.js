const Models = require("@models");
const sequelize = require("@src/shared/database");

const { Op, literal, fn } = require("sequelize");

exports.updateSessionStats = async (tutorId) => {
  const { TutorStat, Booking, Review } = require("@models");
  const totalCompletedSessions = await Booking.count({
    where: {
      tutorId,
      status: "completed",
    },
  });

  const [studentResult] = await Booking.findAll({
    where: {
      tutorId,
      status: "completed",
    },
    attributes: [
      [
        sequelize.fn(
          "COUNT",
          sequelize.fn("DISTINCT", sequelize.col("student_id"))
        ),
        "totalStudents",
      ],
    ],
    raw: true,
  });

  const totalStudents = Number(studentResult?.totalStudents || 0);

  // const totalHoursTaught = await Booking.sum(
  //   literal('("endTime" - "startTime") / 3600'),
  //   {
  //     where: {
  //       tutorId,
  //       status: "completed",
  //     },
  //   }
  // );

  const totalSeconds = await Booking.findOne({
    where: {
      tutorId,
      status: "completed",
    },
    attributes: [
      [
        sequelize.fn(
          "SUM",
          sequelize.literal(
            "EXTRACT(EPOCH FROM (actual_end_time - actual_start_time))"
          )
        ),
        "totalSeconds",
      ],
    ],
    raw: true,
  });

  const totalHoursTaught = Number(totalSeconds?.totalSeconds || 0) / 3600;

  // await Booking.findAll({
  //   where: {
  //     tutorId,
  //     status: "completed",
  //   },
  //   attributes: [
  //     [sequelize.fn("SUM", sequelize.col("actual_start_time")), "startTime"],
  //     [sequelize.fn("SUM", sequelize.col("actual_end_time")), "endTime"],
  //   ],
  //   raw: true,
  // });

  // SELECT (EXTRACT(EPOCH FROM timestamptz '2013-07-01 12:00:00') -
  //       EXTRACT(EPOCH FROM timestamptz '2013-03-01 12:00:00'))
  //       / 60 / 60 / 24;
  // const totalHoursTaught = Number(
  //   (actualEndTime - actualStartTime) / (1000 * 60 * 60)
  // );

  const oneWeekAgo = new Date().setDate(new Date().getDate() - 7);

  const totalWeeklySessions = await Booking.count({
    where: {
      tutorId,
      status: "completed",
      scheduledStart: {
        [Op.gte]: oneWeekAgo,
      },
    },
  });

  await TutorStat.update(
    {      
      totalCompletedSessions,
      totalWeeklySessions,
      totalStudents,
      totalHoursTaught,
      totalReviews: await Review.count({
        where: {
          revieweeId: tutorId,
        },
      }),
    },
    {
      where: {
        tutorId,
      },
    }
  );
};

exports.updatRatingsStats = async (tutorId) => {
  const { TutorStat, Review } = require("@models");
  const [updateRatingsStats] = await Review.findAll({
    where: {
      tutorId,
    },
    attributes: [
      [sequelize.fn("AVG", sequelize.col("rating")), "averageRating"],
      [sequelize.fn("COUNT", sequelize.col("id")), "totalReviews"],
    ],
    raw: true,
  });
  await TutorStat.update(
    {
      totalReviews: Number(updateRatingsStats?.totalReviews || 0),
      averageRating: Number(updateRatingsStats?.averageRating || 0),
      lastUpdated: new Date(),
    },
    {
      where: {
        tutorId,
      },
    }

  );

  exports.updateAllStats = async (tutorId) => {
    Promise.all([
      await this.updateSessionStats(tutorId),
      await this.updateRatingsStats(tutorId),
    ]);
  };
};
