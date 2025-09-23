const reviewService = require("./review.service");
const sendResponse = require("@utils/sendResponse");
const ApiError = require("@utils/apiError");

/**
 * Create a new review.
 * POST /api/reviews
 * Expects reviewerId (from authenticated user), revieweeId, rating, comment, type, sessionId (optional) in req.body.
 */
const createReview = async (req, res, next) => {
  try {
    // Get the reviewer ID from the authenticated user
    const reviewerId = req.user.id;

    // Prepare data for the service layer
    const reviewData = {
      reviewerId,
      ...req.body, // Spread other fields (revieweeId, rating, comment, type, sessionId)
    };

    // Call the service function to create the review
    const newReview = await reviewService.createReview(reviewData);
    // Send the response with the formatted review data
    sendResponse(res, 201, "Review created successfully", newReview);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reviews associated with a specific session ID.
 * GET /api/reviews/session/:sessionId
 */
const getReviewsBySession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Validate sessionId if necessary (basic check)
    if (!sessionId) {
      // This case might be caught by route param validation middleware
      throw new ApiError("Session ID is required", 400);
    }

    // Call the service function to fetch reviews by session ID
    const reviews = await reviewService.getReviewsBySessionId(sessionId);

    // Send the response
    sendResponse(res, 200, "Reviews fetched successfully", reviews);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reviews targeted at a specific tutor (where tutor is the reviewee).
 * GET /api/reviews/tutor/:tutorId
 */
const getReviewsForTutor = async (req, res, next) => {
  try {
    const { tutorId } = req.params;

    // Validate tutorId if necessary (basic check)
    if (!tutorId) {
      throw new ApiError("Tutor ID is required", 400);
    }

    // Call the service function to fetch reviews for the tutor
    const reviews = await reviewService.getReviewsForTutor(tutorId);

    // Send the response
    sendResponse(res, 200, "Tutor reviews fetched successfully", reviews);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reviews targeted at a specific student (where student is the reviewee).
 * GET /api/reviews/student/:studentId
 */
const getReviewsForStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Validate studentId if necessary (basic check)
    if (!studentId) {
      throw new ApiError("Student ID is required", 400);
    }

    // Call the service function to fetch reviews for the student
    const reviews = await reviewService.getReviewsForStudent(studentId);

    // Send the response
    sendResponse(res, 200, "Student reviews fetched successfully", reviews);
  } catch (error) {
    next(error);
  }
};

// Placeholder for fetching reviews *by* a specific user (as reviewer)
// This could be useful for a user's profile page showing reviews they wrote.
/**
 * Get all reviews written by a specific user (where user is the reviewer).
 * GET /api/reviews/reviewer/:userId
 */
const getReviewsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate userId if necessary (basic check)
    if (!userId) {
      throw new ApiError("User ID is required", 400);
    }

    // Call the service function to fetch reviews by the user
    const reviews = await reviewService.getReviewsByUser(userId);

    // Send the response
    sendResponse(res, 200, "Reviews by user fetched successfully", reviews);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a review (only the original reviewer can edit)
 * PUT /api/reviews/:reviewId
 */
const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const currentUserId = req.user.id;
    const payload = req.body; // { rating?, comment? }

    const updated = await reviewService.updateReview(
      reviewId,
      currentUserId,
      payload
    );
    sendResponse(res, 200, "Review updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review (only the original reviewer can delete)
 * DELETE /api/reviews/:reviewId
 */
const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const currentUserId = req.user.id;

    await reviewService.deleteReview(reviewId, currentUserId);
    sendResponse(res, 200, "Review deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

/**
 * Get review aggregates for a specific user (totalReviews, averageRating)
 * GET /api/reviews/aggregates/:userId
 */
const getReviewAggregatesForUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) throw new ApiError("User ID is required", 400);

    const aggregates = await reviewService.getReviewAggregatesForUser(userId);
    sendResponse(res, 200, "Review aggregates fetched successfully", aggregates);
  } catch (error) {
    next(error);
  }
};

// Export all controller functions
module.exports = {
  createReview,
  getReviewsBySession,
  getReviewsForTutor,
  getReviewsForStudent,
  getReviewsByUser, // Export placeholder
  updateReview,
  deleteReview,
  getReviewAggregatesForUser
};
