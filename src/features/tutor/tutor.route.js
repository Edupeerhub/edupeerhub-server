const express = require("express");

const validate = require("@src/shared/middlewares/validate.middleware");

const {
  protectRoute,
  requireVerifiedUser,
} = require("@features/auth/auth.middleware");
const createRateLimiter = require("@src/shared/middlewares/rateLimit.middleware");
const rateLimitConfig = require("@src/shared/config/rateLimit.config");
const tutorController = require("./tutor.controller");
const {
  searchValidator,

  scheduleSearchValidator,
  availabilityValidator,
  canEditProfileValidator,
  updateProfileSchema,
  createProfileSchema,
} = require("./tutor.middleware");
const router = express.Router();

router.use(protectRoute);
router.use(requireVerifiedUser);

router.post("/", validate(createProfileSchema), tutorController.createTutor);
router.get("/", searchValidator, tutorController.getTutors);
router.get("/:id", tutorController.getTutor);
// router.delete("/:id", tutorController.deleteTutor);  // TODO: Move to general user route
router.put(
  "/:id",
  validate(updateProfileSchema),
  // canEditProfileValidator,
  tutorController.updateTutor
);
router.get("/recommendations", tutorController.getTutorRecommendations);

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
