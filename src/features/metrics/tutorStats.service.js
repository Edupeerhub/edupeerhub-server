const Models = require("@models");
const sequelize = require("@src/shared/database");
const { Op, literal, fn } = require("sequelize");

/**
 * Update tutor session-related stats:
 * - Total completed sessions
 * - Weekly sessions
 * - Total unique students
 * - Total hours taught
 * - Total reviews count
 */
exports.updateSessionStats = async (tutorId) => {
  const { TutorStat, Booking, Review } = require("@models");

  // Total completed sessions
  const totalCompletedSessions = await Booking.count({
    where: {
      tutorId,
      status: "completed",
    },
  });

  // Total unique students
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

  // Total hours taught (in seconds → hours)
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

  // Weekly sessions (past 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const totalWeeklySessions = await Booking.count({
    where: {
      tutorId,
      status: "completed",
      scheduledStart: {
        [Op.gte]: oneWeekAgo,
      },
    },
  });

  // Update TutorStat table
  await TutorStat.update(
    {
      totalCompletedSessions,
      totalWeeklySessions,
      totalStudents,
      totalHoursTaught,
      reviewBreakdown: await Review.findAll({
        where: {
          revieweeId: tutorId,
        },
        attributes: ["rating", [sequelize.fn("COUNT", "*"), "count"]],
        group: ["rating"],
        raw: true,
      }).then((reviews) => {
        const breakdown = {};
        reviews.forEach((review) => {
          breakdown[review.rating] = review.count;
        });
        return breakdown;
      }),
      totalReviews: await Review.count({
        where: {
          revieweeId: tutorId,
        },
      }),
    },
    {
      where: { tutorId },
    }
  );
};

/**
 * Update tutor rating stats:
 * - Average rating
 * - Total reviews
 */
exports.updateRatingsStats = async (tutorId) => {
  const { TutorStat, Review } = require("@models");

  const [ratingsData] = await Review.findAll({
    where: {
      revieweeId: tutorId,
      type: "student_to_tutor",
    },
    attributes: [
      [sequelize.fn("AVG", sequelize.col("rating")), "averageRating"],
      [sequelize.fn("COUNT", sequelize.col("id")), "totalReviews"],
    ],
    raw: true,
  });

  await TutorStat.update(
    {
      totalReviews: Number(ratingsData?.totalReviews || 0),
      averageRating: Number(ratingsData?.averageRating || 0),
      reviewBreakdown: await Review.findAll({
        where: {
          revieweeId: tutorId,
        },
        attributes: ["rating", [sequelize.fn("COUNT", "*"), "count"]],
        group: ["rating"],
        raw: true,
      }).then((reviews) => {
        const breakdown = {};
        reviews.forEach((review) => {
          breakdown[review.rating] = review.count;
        });
        return breakdown;
      }),
      lastUpdated: new Date(),
    },
    {
      where: { tutorId },
    }
  );
};

/**
 * Update all tutor stats at once
 */
exports.updateAllStats = async (tutorId, models) => {
  await Promise.all([
    exports.updateSessionStats(tutorId, models),
    exports.updateRatingsStats(tutorId, models),
  ]);
};
