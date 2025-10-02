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

// GET /api/tutors              // Browse tutors with filters
router.get("/", validate(searchValidator, "params"), tutorController.getTutors);

//GET tutor recommendations
//TODO: requre tutor role for appropriate routes
router.post("/", validate(createProfileSchema), tutorController.createTutor);
router.get("/recommendations", tutorController.getTutorRecommendations);
router.get("/:id", tutorController.getTutor);

router.put(
  "/:id",
  validate(updateProfileSchema),
  // canEditProfileValidator,
  tutorController.updateTutor
);

module.exports = router;
