const sendResponse = require("@utils/sendResponse");
const tutorService = require("./tutor.service");
const queryStringToList = require("@src/shared/utils/commaStringToList");
const ApiError = require("@src/shared/utils/apiError");
const trackEvent = require("../events/events.service");
const eventTypes = require("../events/eventTypes");
const { addStreamUser } = require("../auth/auth.service");
const { uploadFileToS3 } = require("@src/shared/utils/s3");

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

  const folder =
    process.env.NODE_ENV === "development"
      ? "tutor-documents-test"
      : "tutor-documents";

  let documentKey = null;
  if (req.file) {
    const { key } = await uploadFileToS3(req.file, folder);
    documentKey = key;
  }

  const newTutor = await tutorService.createTutor({
    profile,
    userId: req.user.id,
    documentKey,
  });

  await trackEvent(eventTypes.USER_ONBOARDED, {
    userId: newTutor.userId,
    email: newTutor.user.email,
    role: newTutor.user.role,
    fullName: `${newTutor.user.firstName} ${newTutor.user.lastName}`,
  });

  await addStreamUser({
    id: newTutor.userId,
    email: newTutor.user.email,
    role: newTutor.user.role,
    firstName: newTutor.user.firstName,
    lastName: newTutor.user.lastName,
  });

  sendResponse(res, 201, "Onboarding successful", newTutor);
};

exports.updateTutor = async (req, res) => {
  const tutorId = req.params.id;
  const tutorProfile = req.body;

  if (tutorId !== req.user.id) {
    throw new ApiError("You're not allowed to update this profile", 403);
  }
  const updatedTutorProfile = await tutorService.updateTutorProfile({
    id: tutorId,
    tutorProfile,
  });

  await addStreamUser({
    id: updatedTutorProfile.userId,
    email: updatedTutorProfile.user.email,
    role: updatedTutorProfile.user.role,
    firstName: updatedTutorProfile.user.firstName,
    lastName: updatedTutorProfile.user.lastName,
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
