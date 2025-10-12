const sequelize = require("@src/shared/database");
const { Op } = require("sequelize");

/**
 * Update tutor session-related stats:
 * - Total completed sessions
 * - Weekly sessions
 * - Total unique students
 * - Total hours taught
 * - Total reviews count
 */
exports.updateSessionStats = async (tutorId) => {
  const { TutorStat, Booking } = require("@models");

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

  // const [stat] = await TutorStat.findOrCreate({
  //   where: { tutorId },
  //   defaults: {
  //     tutorId,
  //     totalCompletedSessions: 0,
  //     totalWeeklySessions: 0,
  //     totalStudents: 0,
  //     totalHoursTaught: 0.0,
  //   },
  // });

  // await stat.update({
  //   totalCompletedSessions,
  //   totalWeeklySessions,
  //   totalStudents,
  //   totalHoursTaught,
  // });

  // Update TutorStat table
  // await TutorStat.update(
  //   {
  //     totalCompletedSessions,
  //     totalWeeklySessions,
  //     totalStudents,
  //     totalHoursTaught,
  //   },
  //   {
  //     where: { tutorId },
  //   }
  // );

  await TutorStat.upsert(
    {
      tutorId,
      totalCompletedSessions,
      totalWeeklySessions,
      totalStudents,
      totalHoursTaught,
    },
    {
      conflictFields: ["tutor_id"], // For PostgreSQL
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

  const totalReviews = Number(ratingsData?.totalReviews || 0);
  const averageRating = Number(
    parseFloat(ratingsData?.averageRating || 0).toFixed(2)
  );

  // Get rating counts
  const ratingCounts = await Review.findAll({
    where: {
      revieweeId: tutorId,
      type: "student_to_tutor",
    },
    attributes: ["rating", [sequelize.fn("COUNT", "*"), "count"]],
    group: ["rating"],
    raw: true,
  });

  // Build count map
  const countMap = ratingCounts.reduce((acc, item) => {
    acc[item.rating] = parseInt(item.count, 10);
    return acc;
  }, {});

  // Build breakdown array with percentages (5 → 1)
  const reviewBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = countMap[stars] || 0;
    const percent =
      totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, percent };
  });

  // await TutorStat.update(
  //   {
  //     totalReviews,
  //     averageRating,
  //     reviewBreakdown, // Now stored as array with percentages
  //     lastUpdated: new Date(),
  //   },
  //   {
  //     where: { tutorId },
  //   }
  // );

  await TutorStat.upsert(
    {
      tutorId,
      totalReviews,
      averageRating,
      reviewBreakdown,
      lastUpdated: new Date(),
    },
    {
      conflictFields: ["tutor_id"], // For PostgreSQL
    }
  );
};

/**
 * Update all tutor stats at once
 */
exports.updateAllStats = async (tutorId) => {
  const { TutorStat } = require("@models");

  await TutorStat.findOrCreate({
    where: { tutorId },
    defaults: {
      tutorId,
      totalCompletedSessions: 0,
      totalWeeklySessions: 0,
      totalStudents: 0,
      totalHoursTaught: 0.0,
      averageRating: 0.0,
      totalReviews: 0,
      reviewBreakdown: [
        { stars: 5, percent: 0 },
        { stars: 4, percent: 0 },
        { stars: 3, percent: 0 },
        { stars: 2, percent: 0 },
        { stars: 1, percent: 0 },
      ],
    },
  });

  await Promise.all([
    exports.updateSessionStats(tutorId),
    exports.updateRatingsStats(tutorId),
  ]);
};
