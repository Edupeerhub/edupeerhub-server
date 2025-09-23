const express = require('express');
const router = express.Router();
const authMiddleware = require('@features/auth/auth.middleware'); // Adjust path if needed
const validate = require('../../shared/middlewares/validate.middleware'); // Adjust path if needed
const reviewController = require('./review.controller'); // Adjust path if needed

// Import validator
const reviewValidator = require('./review.validator'); // Adjust path if needed

router.use(authMiddleware.protectRoute);

// --- Review Routes ---

// POST /api/reviews
// Create a new review
// Requires authentication
// Validates the request body for creating a review
router.post(
  '/',
  validate(reviewValidator.createReview.body, 'body'), // Validate request body
  reviewController.createReview
);

// GET /api/reviews/session/:sessionId
// Fetch all reviews associated with a specific session ID
// Validates the session ID parameter
// router.get(
//   '/session/:sessionId',
//   validate(reviewValidator.getReviewsBySession.params, 'params'), // Validate route params
//   reviewController.getReviewsBySession
// );

// GET /api/reviews/tutor/:tutorId
// Fetch all reviews targeted at a specific tutor (where tutor is the reviewee)
// Validates the tutor ID parameter
router.get(
  '/tutor/:tutorId',
  validate(reviewValidator.getReviewsForTutor.params, 'params'), // Validate route params
  reviewController.getReviewsForTutor
);

// GET /api/reviews/student/:studentId
// Fetch all reviews targeted at a specific student (where student is the reviewee)
// Validates the student ID parameter
router.get(
  '/student/:studentId',
  validate(reviewValidator.getReviewsForStudent.params, 'params'), // Validate route params
  reviewController.getReviewsForStudent
);

// GET /api/reviews/reviewer/:userId
// Fetch all reviews written by a specific user (where user is the reviewer)
// Validates the user ID parameter
router.get(
  '/reviewer/:userId',
  validate(reviewValidator.getReviewsByUser.params, 'params'), // Validate route params
  reviewController.getReviewsByUser
);

// GET /api/reviews/aggregates/:userId
// Fetch aggregated review stats for a user (totalReviews, averageRating)
router.get(
  '/aggregates/:userId',
  validate(reviewValidator.getReviewAggregates.params, 'params'),
  reviewController.getReviewAggregatesForUser
);

// PUT /api/reviews/:reviewId  -> update a review (only owner)
router.put(
  '/:reviewId',
  validate(reviewValidator.updateReview.params, 'params'),
  validate(reviewValidator.updateReview.body, 'body'),
  reviewController.updateReview
);

// DELETE /api/reviews/:reviewId  -> delete a review (only owner)
router.delete(
  '/:reviewId',
  validate(reviewValidator.deleteReview.params, 'params'),
  reviewController.deleteReview
);

module.exports = router;