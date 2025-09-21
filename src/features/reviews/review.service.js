const ApiError = require("@utils/apiError");
const { Review, User,} = require ("@models");
const sequelize = require("@src/shared/database");

const createReview = async (reviewData) => {
  const { reviewerId, revieweeId, rating, comment, type, sessionId } = reviewData;
  if (!reviewerId || !revieweeId || rating === undefined || !type) {
    throw new ApiError('Missing required fields: reviewerId, revieweeId, rating, type', 400);
  }

  // Prevent users from reviewing themselves
  if (reviewerId === revieweeId) {
    throw new ApiError('Users cannot review themselves', 400);
  }

  // Validate rating range (assuming 1-5 based on model)
  if (rating < 1 || rating > 5) {
    throw new ApiError('Rating must be between 1 and 5', 400);
  }

  // Validate review type
  const validTypes = ['tutor_to_student', 'student_to_tutor', 'session_feedback'];
  if (!validTypes.includes(type)) {
    throw new ApiError(`Invalid review type. Must be one of: ${validTypes.join(', ')}`, 400);
  }
  // --- Database Operations ---
  const transaction = await sequelize.transaction();
  try {
    // 1. Create the review
    const newReview = await Review.create({
      reviewerId,
      revieweeId,
      rating,
      comment: comment || null,
      type,
      sessionId: sessionId || null,
    }, { transaction });

    // 2. Verify users and roles
    const [reviewer, reviewee] = await Promise.all([
      User.findByPk(reviewerId, { transaction }),
      User.findByPk(revieweeId, { transaction })
    ]);

    if (!reviewer) throw new ApiError('Reviewer user not found', 400);
    if (!reviewee) throw new ApiError('Reviewee user not found', 400);

    // Role checks based on review type
    if (type === 'tutor_to_student') {
      if (reviewer.role !== 'tutor') throw new ApiError('Reviewer must be a tutor for this review type', 400);
      if (reviewee.role !== 'student') throw new ApiError('Reviewee must be a student for this review type', 400);
    } else if (type === 'student_to_tutor') {
      if (reviewer.role !== 'student') throw new ApiError('Reviewer must be a student for this review type', 400);
      if (reviewee.role !== 'tutor') throw new ApiError('Reviewee must be a tutor for this review type', 400);
    }

    // 3. Commit the transaction
    await transaction.commit();

    // 4. Fetch the created review with associated reviewer data for the response
    const createdReviewRaw = await Review.findByPk(newReview.id, {
      include: [{
        model: User,
        as: 'reviewer',
        attributes: ['firstName', 'lastName', 'profileImageUrl']
      }]
    });

    if (!createdReviewRaw) {
      throw new ApiError('Failed to retrieve created review', 500);
    }

    // 5. Format and return the response data
    const review = createdReviewRaw.toJSON();
    return {
      stars: review.rating,
      comment: review.comment,
      date: review.createdAt,
      reviewer: {
        firstName: review.reviewer?.firstName || null,
        lastName: review.reviewer?.lastName || null,
        profileImageUrl: review.reviewer?.profileImageUrl || null
      }
    };

  } catch (error) {
    // --- Handle Errors and Rollback ---
    // If the transaction hasn't been committed, rollback.
    // If it has been committed, this is a no-op.
    if (!transaction.finished) {
      await transaction.rollback();
    }

    // Handle specific database errors
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      if (error.fields && (error.fields.reviewer_id || error.fields.reviewee_id)) {
        throw new ApiError('Invalid reviewerId or revieweeId: User not found', 400);
      }
    }
    // Re-throw all errors (including validation errors) to be handled by the controller
    throw error;
  }
};

const getReviewsBySessionId = async (sessionId) => {
  if (!sessionId) {
    throw new ApiError('Session ID is required', 400);
  }

  try {
    const reviews = await Review.findAll({
      where: { sessionId }, // Find reviews where sessionId matches
      include: [
        { model: User, as: 'reviewer', attributes: ['id', 'firstName', 'lastName', 'profileImageUrl'] },
        { model: User, as: 'reviewee', attributes: ['id', 'firstName', 'lastName', 'profileImageUrl'] }
      ],
      order: [['createdAt', 'DESC']] // Order by creation date, newest first
    });

    return reviews.map(review => review.toJSON()); // Return array of plain objects
  } catch (error) {
    throw new ApiError('Failed to fetch reviews by session ID', 500, error);
  }
};

/**
 * Fetches all reviews targeted *at* a specific tutor (reviews where they are the reviewee).
 * @param {string} tutorId - The UUID of the tutor (user ID).
 * @returns {Promise<Array<Object>>} An array of review objects.
 * @throws {ApiError} If database operation fails.
 */
const getReviewsForTutor = async (tutorId) => {
    if (!tutorId) {
        throw new ApiError('Tutor ID is required', 400);
    }

    try {
        const tutorUser = await User.findByPk(tutorId, {
            attributes: ['id', 'role']
        });

        if (!tutorUser) {
            throw new ApiError('User not found', 404);
        }

        if (tutorUser.role !== 'tutor') {
            throw new ApiError('The specified user ID does not belong to a tutor', 400);
        }

        const reviews = await Review.findAll({
            where: { revieweeId: tutorId },
            order: [['createdAt', 'DESC']]
        });

        return reviews.map(r => {
            const raw = r.toJSON();
            return {
                reviewId: raw.id,
                reviewerId: raw.reviewerId,
                revieweeId: raw.revieweeId,
                stars: raw.rating,
                comment: raw.comment,
                type: raw.type,
                createdAt: raw.createdAt
            };
        });
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to fetch reviews for tutor', 500, error);
    }
};

const getReviewsForStudent = async (studentId) => {
    if (!studentId) {
        throw new ApiError('Student ID is required', 400);
    }

    try {
        const studentUser = await User.findByPk(studentId, {
            attributes: ['id', 'role']
        });

        if (!studentUser) {
            throw new ApiError('User not found', 404);
        }

        if (studentUser.role !== 'student') {
            throw new ApiError('The specified user ID does not belong to a student', 400);
        }

        const reviews = await Review.findAll({
            where: { revieweeId: studentId },
            order: [['createdAt', 'DESC']]
        });

        return reviews.map(r => {
            const raw = r.toJSON();
            return {
                reviewId: raw.id,
                reviewerId: raw.reviewerId,
                revieweeId: raw.revieweeId,
                stars: raw.rating,
                comment: raw.comment,
                type: raw.type,
                createdAt: raw.createdAt
            };
        });
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to fetch reviews for student', 500, error);
    }
};

const getReviewsByUser = async (userId) => {
    if (!userId) {
        throw new ApiError('User ID is required', 400);
    }

    try {
        const reviews = await Review.findAll({
            where: { reviewerId: userId },
            order: [['createdAt', 'DESC']]
        });

        return reviews.map(r => {
            const raw = r.toJSON();
            return {
                reviewId: raw.id,
                reviewerId: raw.reviewerId,
                revieweeId: raw.revieweeId,
                stars: raw.rating,
                comment: raw.comment,
                type: raw.type,
                createdAt: raw.createdAt
            };
        });
    } catch (error) {
        throw new ApiError('Failed to fetch reviews by user', 500, error);
    }
};

// Get review aggregates for specific users
const getReviewAggregatesForUser = async (userId) => {
  if (!userId) {
    throw new ApiError('User ID is required', 400);
  }

  try {
    const result = await Review.findOne({
      where: { revieweeId: userId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
        // Add other aggregations as needed (e.g., distribution of ratings)
      ]
    });

    if (!result) {
      // No reviews found, return default values
      return {
        totalReviews: 0,
        averageRating: null
      };
    }

    const rawData = result.toJSON();
    const averageRating = rawData.averageRating ? parseFloat(rawData.averageRating) : null;
    const totalReviews = parseInt(rawData.totalReviews, 10) || 0;

    return {
      totalReviews,
      averageRating: averageRating !== null ? Number(averageRating.toFixed(2)) : null // Round to 2 decimal places
    };
  } catch (error) {
    throw new ApiError('Failed to calculate review aggregates for user', 500, error);
  }
};

/**
 * Update a review's comment/rating.
 * Only the original reviewer may update their review.
 */
const updateReview = async (reviewId, currentUserId, payload) => {
  if (!reviewId) throw new ApiError('Review ID is required', 400);

  try {
    const review = await Review.findByPk(reviewId);
    if (!review) throw new ApiError('Review not found', 404);

    if (review.reviewerId !== currentUserId) {
      throw new ApiError('You are not authorized to update this review', 403);
    }

    const { comment, rating } = payload || {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) throw new ApiError('Rating must be between 1 and 5', 400);
      review.rating = rating;
    }
    if (comment !== undefined) review.comment = comment;

    await review.save();

    const raw = review.toJSON();
    return {
      reviewId: raw.id,
      reviewerId: raw.reviewerId,
      revieweeId: raw.revieweeId,
      stars: raw.rating,
      comment: raw.comment,
      type: raw.type,
      updatedAt: raw.updatedAt,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to update review', 500, error);
  }
};

/**
 * Delete a review (soft-delete via paranoid model).
 * Only the original reviewer may delete their review.
 */
const deleteReview = async (reviewId, currentUserId) => {
  if (!reviewId) throw new ApiError('Review ID is required', 400);

  try {
    const review = await Review.findByPk(reviewId);
    if (!review) throw new ApiError('Review not found', 404);

    if (review.reviewerId !== currentUserId) {
      throw new ApiError('You are not authorized to delete this review', 403);
    }

    await review.destroy(); // paranoid: true will soft-delete (set deleted_at)
    return;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to delete review', 500, error);
  }
};

module.exports = {
  createReview,
  getReviewsBySessionId,
  getReviewsForTutor,
  getReviewsForStudent,
  getReviewsByUser,
  getReviewAggregatesForUser,
  updateReview,
  deleteReview,
};