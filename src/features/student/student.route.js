const express = require("express");
const router = express.Router();
const validate = require("@src/shared/middlewares/validate.middleware");
const studentValidator = require("./student.validator");
const studentController = require("./student.controller");
const authMiddleware = require("@features/auth/auth.middleware");

router.use(authMiddleware.protectRoute);
router.get(
  "/",
  authMiddleware.requireVerifiedAndOnboardedUser,
  studentController.listStudents
);

router.get(
  "/:id",
  authMiddleware.requireVerifiedAndOnboardedUser,

  validate(studentValidator.getStudentById.params, "params"),
  studentController.getStudent
);

router.put(
  "/:id",
  authMiddleware.requireVerifiedAndOnboardedUser,
  validate(studentValidator.updateStudent.params, "params"),
  validate(studentValidator.updateStudent.body, "body"),
  studentController.updateStudent
);

router.post(
  "/",
  authMiddleware.requireVerifiedUser,
  validate(studentValidator.createStudent.body, "body"),
  studentController.onboarding
);

module.exports = router;
