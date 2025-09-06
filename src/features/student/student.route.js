const express = require("express");
const router = express.Router();
const validate = require("../../shared/middlewares/validate.middleware");
const studentValidator = require("./student.validator");
const studentController = require("./student.controller");
const authMiddleware = require("../../features/auth/auth.middleware");

router.use(authMiddleware.protectRoute);
//  GET /api/students 		// Get all students
router.get(
  "/",
  authMiddleware.requireVerifiedAndOnboardedUser,

  studentController.listStudents
);

// GET /api/students/:id          // Individual student profile
router.get(
  "/:id",
  authMiddleware.requireVerifiedAndOnboardedUser,

  validate(studentValidator.getStudentById.params, "params"),
  studentController.getStudent
);

// PUT /api/students/:id     // Update student profile
router.put(
  "/:id",
  authMiddleware.requireVerifiedAndOnboardedUser,
  validate(studentValidator.updateStudent.params, "params"),
  validate(studentValidator.updateStudent.body, "body"),
  studentController.updateStudent
);

router.delete(
  "/:id",
  authMiddleware.requireVerifiedAndOnboardedUser,
  validate(studentValidator.getStudentById.params, "params"),
  studentController.deleteStudent
);

// POST /api/students/onboarding/:id        // Create student profile
router.post(
  "/",
  authMiddleware.requireVerifiedUser,
  validate(studentValidator.createStudent.body, "body"),
  studentController.onboarding
);

module.exports = router;
