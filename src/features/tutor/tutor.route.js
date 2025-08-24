const express = require("express");

const validate = require("@src/shared/middlewares/validate.middleware");

const { protectRoute } = require("@features/auth/auth.middleware");
const createRateLimiter = require("@src/shared/middlewares/rateLimit.middleware");
const rateLimitConfig = require("@src/shared/config/rateLimit.config");
const tutorController = require("./tutor.controller");
const {
  searchValidator,
  profileValidator,
  scheduleSearchValidator,
  availabilityValidator,
  canEditProfileValidator,
} = require("./tutor.middleware");
const router = express.Router();

router.use(protectRoute);
// GET /api/tutors              // Browse tutors with filters
router.get("/", searchValidator, tutorController.getTutors);
// GET /api/tutors/:id          // Individual tutor profile
router.get("/:id", tutorController.getTutor);
// POST /api/tutors         // Create tutor profile
router.post("/", profileValidator, tutorController.createTutor);
// PUT /api/tutors/:id     // Update tutor profile
router.put(
  "/:id",
  profileValidator,
  // canEditProfileValidator,
  tutorController.updateTutor
);

// GET /api/tutors/:id/schedule  // Get tutor's schedule
router.get(
  "/:id/schedule",
  scheduleSearchValidator,
  tutorController.getTutorSchedule
);

// POST /api/tutors/availability      // Set weekly availability
router.post(
  "/availability",
  availabilityValidator,
  tutorController.getTutorAvailability
);
// PUT /api/tutors//availability   // Update weekly availability
router.put(
  "/availability",
  availabilityValidator,
  tutorController.updateAvailability
);

router.delete("/:id/availabilty", tutorController.updateAvailability);

module.exports = router;
