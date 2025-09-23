const express = require("express");
const router = express.Router();
const authMiddleware = require("@features/auth/auth.middleware");
const validate = require("../../shared/middlewares/validate.middleware");
const reviewController = require("./review.controller");
const reviewValidator = require("./review.validator");

router.use(authMiddleware.protectRoute);

// --- Review Routes ---

router.post(
  "/",
  validate(reviewValidator.createReview, "body"),
  reviewController.createReview
);

router.get(
  "/tutor/:tutorId",
  validate(reviewValidator.getReviewsForTutor, "params"),
  reviewController.getReviewsForTutor
);

router.get(
  "/student/:studentId",
  validate(reviewValidator.getReviewsForStudent, "params"),
  reviewController.getReviewsForStudent
);

router.get(
  "/reviewer/:userId",
  validate(reviewValidator.getReviewsByUser, "params"),
  reviewController.getReviewsByUser
);

router.get(
  "/aggregates/:userId",
  validate(reviewValidator.getReviewAggregates, "params"),
  reviewController.getReviewAggregatesForUser
);

router.put(
  "/:reviewId",
  validate(reviewValidator.updateReviewParams, "params"),
  validate(reviewValidator.updateReviewBody, "body"),
  reviewController.updateReview
);

router.delete(
  "/:reviewId",
  validate(reviewValidator.deleteReview, "params"),
  reviewController.deleteReview
);

module.exports = router;
