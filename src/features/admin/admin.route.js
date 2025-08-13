const express = require("express");
const adminController = require("./admin.controller");
const { protectRoute, requireAdminRole } = require("../auth/auth.middleware");

const router = express.Router();

// router.use(protectRoute);
// router.use(requireAdminRole);

router.get("/users", adminController.getAllUsers); // Get all users (including suspended, deleted) excluding super admins and admins (only super admins gets all users)
router.get("/users/:id", adminController.getUserById);
router.get("/tutors", adminController.getAllTutors);
router.get("/students", adminController.getAllStudents);

// GET /api/admin/tutors/pending  // Get all pending approvals
router.get("/tutors/pending", adminController.getPendingTutors);
// GET /api/admin/tutors/:id/pending  // Get a pending approval
router.get("/tutors/:id/pending", adminController.getPendingTutorById);
// PUT /api/admin/tutors/:id/approve  // Admin approval (sends an email)
router.patch("/tutors/:id/approve", adminController.approveTutor);
// PUT /api/admin/tutors/:id/reject  // Admin rejection (sends an email, with a reason?)
router.patch("/tutors/:id/reject", adminController.rejectTutor);

// Super Admins only
router.post("/", adminController.createAdmin);
router.get("/", adminController.getAllAdmins); // Super Admins Only

// Later, we can add more routes for admin functionalities

// PATCH /api/user/:id/restore  // Restore soft deleted user account

// User Reporting and Moderation

// POST /api/user/:id/report  // Report tutor/student (flag in reports table for this + report reason)
// POST /api/session/:id/report  // Report session (flag in reports table for this + report reason)
// GET /api/admin/report  // Get all reports
// GET /api/admin/report/:id  // Admin review/moderation
// PATCH /api/admin/report/:id/resolve  // Admin resolve report (update status in reports table)

// PATCH /api/admin/user/:id/ban  // Admin suspension (super admins can ban/unban other admins)
// PATCH /api/admin/user/:id/unban  // Admin remove suspension

module.exports = router;
