"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { TutorStat, Tutor } = require("../models");
    const {
      updateAllStats,
    } = require("../../../features/metrics/tutorStats.service");

    const tutors = await Tutor.findAll({
      attributes: ["userId"],
      raw: true,
    });

    console.log(`Found ${tutors.length} tutors to update`);

    for (const tutor of tutors) {
      try {
        const [stat, created] = await TutorStat.findOrCreate({
          where: { tutorId: tutor.userId },
          defaults: {
            tutorId: tutor.userId,
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

        await updateAllStats(tutor.userId);
        console.log(`Updated stats for tutor ${tutor.userId}`);
      } catch (error) {
        console.error(`Failed to update tutor ${tutor.userId}:`, error.message);
      }
    }

    console.log("Stats population completed!");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("tutor_stats", null, {});
  },
};
