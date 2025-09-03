const sendResponse = require("@utils/sendResponse");
const tutorService = require("./tutor.service");

const queryStringToList = require("@src/shared/utils/commaStringToList");
const ApiError = require("@src/shared/utils/apiError");
exports.getTutors = async (req, res) => {
  //params
  const page = req.query?.page ?? 1;
  const limit = req.query?.limit ?? 10;

  //filters
  const subjects = queryStringToList(req.query?.subjects);
  const availability = queryStringToList(req.query?.availability);
  const ratings = queryStringToList(req.query?.rating);

  const tutors = await tutorService.getTutors({
    page: page,
    limit: limit,
    subjects,
    availability,
    ratings,
  });
  sendResponse(res, 200, "Tutors retrieved successfully", tutors);
};

exports.getTutor = async (req, res) => {
  const tutor = await tutorService.getTutor(req.params.id);

  if (tutor === null) {
    throw new ApiError("Tutor not found", 404);
  }
  sendResponse(res, 200, "success", tutor);
};

exports.createTutor = async (req, res) => {
  const profile = {
    ...req.body,
    rating: 0.0,
    approvalStatus: "pending",
    profileVisibility: "hidden",

    userId: req.user.id,
  };
  const newTutor = await tutorService.createTutor({
    profile,
    userId: req.user.id,
  });

  sendResponse(res, 201, "created successfully", newTutor);
};

exports.updateTutor = async (req, res) => {
  const tutorId = req.params.id;
  const tutorProfile = req.body;

  if (tutorId !== req.user.id) {
    throw new ApiError("Unauthorized", 403, null);
  }
  const updatedTutorProfile = await tutorService.updateTutorProfile({
    id: tutorId,
    tutorProfile,
  });

  sendResponse(res, 200, "success", updatedTutorProfile);
};

exports.getTutorRecommendations = async (req, res) => {
  const userId = req.user.id;

  const { page, limit } = req.query;
  const tutorRecommendations = await tutorService.getTutorRecommendations({
    userId,
    page,
    limit,
  });
  sendResponse(res, 200, "success", tutorRecommendations);
};

exports.getTutorSchedule = async (req, res) => {};

exports.getTutorAvailability = async (req, res) => {};

exports.updateAvailability = async (req, res) => {};

exports.deleteAvailability = async (req, res) => {};
