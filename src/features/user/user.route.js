const express = require("express");
const {
  protectRoute,
  requireVerifiedAndOnboardedUser,
} = require("@features/auth/auth.middleware");
const {
  uploadSingleProfilePic,
} = require("@src/shared/middlewares/upload.middleware");
const validate = require("@src/shared/middlewares/validate.middleware");
const {
  updateProfileSchema,
  checkUserOwnsProfile,
} = require("./user.middleware.js");
const normalizeMultipartFields = require("@src/shared/middlewares/normalizeMultipartFields");
const userController = require("./user.controller");

const router = express.Router();

router.use(protectRoute);
router.use(requireVerifiedAndOnboardedUser);

router.patch(
  "/:id",
  checkUserOwnsProfile,
  uploadSingleProfilePic,
  // normalizeMultipartFields,
  validate(updateProfileSchema),
  userController.updateProfile
);
router.get("/", userController.profile);
router.delete("/:id", checkUserOwnsProfile, userController.deleteUser);

module.exports = router;
