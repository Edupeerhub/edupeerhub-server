const express = require("express");
const adminController = require("./admin.controller");
const { protectRoute } = require("@features/auth/auth.middleware");
const { requireSuperAdmin, requireAdmin } = require("./admin.middleware");
const validate = require("@src/shared/middlewares/validate.middleware");
const adminValidation = require("./admin.validator");

const router = express.Router();

router.use(protectRoute);
router.use(requireAdmin);

// =====================
// User Routes
// =====================
router.get("/users", adminController.getAllUsers);
router.get("/users/counts", adminController.getUserSummaryCounts);
router.get("/users/:id", adminController.getUserById);
router.patch("/users/:id/restore", adminController.restoreUser);

// =====================
// Pending Tutor Routes
// =====================
router.get("/tutors/pending", adminController.getPendingTutors);
router.get("/tutors/:id/pending", adminController.getPendingTutorById);
router.get("/tutors/:id/file", adminController.getTutorDocument);
router.patch("/tutors/:id/approve", adminController.approveTutor);
router.patch(
  "/tutors/:id/reject",
  validate(adminValidation.rejectTutor),
  adminController.rejectTutor
);

router.use(requireSuperAdmin);
router.post(
  "/",
  validate(adminValidation.createAdmin),
  adminController.createAdmin
);
router.get("/", adminController.getAllAdmins);

module.exports = router;

// =====================
// Future Admin & Reporting Routes
// =====================
// PATCH /users/:id/role         // Change user role (tutor/student)
// POST /api/user/:id/report     // Report tutor/student
// POST /api/session/:id/report  // Report session
// GET /api/admin/report         // Get all reports
// GET /api/admin/report/:id     // Admin review/moderation
// PATCH /api/admin/report/:id/resolve // Admin resolve report
// PATCH /api/admin/user/:id/ban       // Admin suspension
// PATCH /api/admin/user/:id/unban     // Remove admin suspension
