const express = require('express');
const router = express.Router();

// Import middlewares and controllers
const authMiddleware = require('../../features/auth/auth.middleware');
const validate = require('../../shared/middlewares/validate.middleware');
const studentController = require('./student.controller');
const studentValidator = require('./student.validator');

// Apply authentication to all student routes
router.use(authMiddleware.protectRoute);

// GET /api/v1/students/:id - Get individual student profile
router.get(
  '/:id',
  (req, res, next) => {
    // Extract the id from params and put it in req.params for validation
    req.params = { id: req.params.id };
    next();
  },
  (req, res, next) => validate(studentValidator.getStudentById, 'params')(req, res, next),
  studentController.getStudent
);

// POST /api/v1/students - Create student profile
router.post(
  '/',
  (req, res, next) => {
    // Only allow students to create their own profile or admins to create any
    if (req.user.role === 'student') {
      const { userId } = req.body;
      if (userId && userId !== req.user.id) {
        return res.status(403).send('Access denied - Students can only create their own profile');
      }
    }
    next();
  },
  (req, res, next) => validate(studentValidator.createStudent, 'body')(req, res, next),
  studentController.createStudentProfile
);

// PUT /api/v1/students/:id - Update student profile
router.put(
  '/:id',
  (req, res, next) => {
    // Extract the id from params and put it in req.params for validation
    req.params = { id: req.params.id };
    next();
  },
  (req, res, next) => validate(studentValidator.updateStudent, 'params')(req, res, next),
  (req, res, next) => validate(studentValidator.updateStudent, 'body')(req, res, next),
  studentController.updateStudentProfile
);

// POST /api/v1/students/onboarding - Complete onboarding
router.post(
  '/onboarding',
  authMiddleware.requireStudentRole,
  (req, res, next) => validate(studentValidator.completeOnboarding, 'body')(req, res, next),
  studentController.completeOnboarding
);

module.exports = router;