const express = require("express");
const router = express.Router()
const validate = require("../../shared/middlewares/validate.middleware");
const studentValidator = require ("./student.validator")
const studentController = require ("./student.controller")
const authMiddleware = require ("../auth/auth.middleware")



//  GET /api/students 		// Get all students
router.get(
	"/",
	authMiddleware.protectRoute,
	studentController.listStudents
);

// GET /api/students/:id          // Individual student profile
router.get(
	"/:id",
	authMiddleware.protectRoute,
	validate(studentValidator.getStudentById.params, "params"),
	studentController.getStudent
);

// PUT /api/students/:id     // Update student profile
router.put(
	"/:id",
	authMiddleware.protectRoute,
	validate(studentValidator.updateStudent.params, "params"),
	validate(studentValidator.updateStudent.body, "body"),
	studentController.updateStudent
);

// DELETE /api/students/:id        // Delete student profile
router.delete(
	"/:id",
	authMiddleware.protectRoute,
	validate(studentValidator.getStudentById.params, "params"),
	studentController.deleteStudent
);

// POST /api/students/onboarding/:id        // Create student profile
router.post(
	"/onboarding/:id",
	authMiddleware.protectRoute,
	validate(studentValidator.getStudentById.params, "params"),
	validate(studentValidator.createStudent.body, "body"),
	studentController.onboarding
);

module.exports = router