const express = require("express");
const validate = require("@src/shared/middlewares/validate.middleware");

const {
  protectRoute,
  requireVerifiedUser,
  requireTutorRole,
} = require("@features/auth/auth.middleware");
const tutorController = require("./tutor.controller");
const {
  searchValidator,
  updateProfileSchema,
  createProfileSchema,
} = require("./tutor.middleware");
const { uploadSingleS3 } = require("@src/shared/middlewares/upload.middleware");
const normalizeMultipartFields = require("@src/shared/middlewares/normalizeMultipartFields");

const router = express.Router();

router.use(protectRoute);
router.use(requireVerifiedUser);

router.get("/recommendations", tutorController.getTutorRecommendations);
router.get("/", validate(searchValidator), tutorController.getTutors);
router.get("/:id", tutorController.getTutor);
router.post(
  "/",
  uploadSingleS3,
  normalizeMultipartFields,
  validate(createProfileSchema),
  tutorController.createTutor
);

router.use(requireTutorRole);
router.put(
  "/:id",
  validate(updateProfileSchema),
  // canEditProfileValidator,
  tutorController.updateTutor
);

module.exports = router;
