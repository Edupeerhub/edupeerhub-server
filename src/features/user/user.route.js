const express = require("express");
const {
  protectRoute,
  requireVerifiedAndOnboardedUser,
} = require("@features/auth/auth.middleware");
const userController = require("./user.controller");

const router = express.Router();

router.use(protectRoute);
router.use(requireVerifiedAndOnboardedUser);

router.get("/", userController.profile);
router.delete("/:id", userController.deleteUser);

module.exports = router;
