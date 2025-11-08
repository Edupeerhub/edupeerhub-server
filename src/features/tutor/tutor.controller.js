const sendResponse = require("@utils/sendResponse");
const tutorService = require("./tutor.service");
const parseDataWithMeta = require("@src/shared/utils/meta");
const queryStringToList = require("@src/shared/utils/commaStringToList");
const ApiError = require("@src/shared/utils/apiError");
const trackEvent = require("../events/events.service");
const eventTypes = require("../events/eventTypes");
const { addStreamUser } = require("../auth/auth.service");
const { uploadFileToS3 } = require("@src/shared/S3/s3Service");
const sendSlackNotification = require("@src/shared/utils/slackNotifier");
const {
  sendAdminTutorOnboardingNotification,
} = require("@src/shared/email/email.service");

exports.getTutors = async (req, res) => {
  //params
  const page = req.query.page ?? 1;
  const limit = req.query.limit ?? 10;

  //filters
  const subjects = queryStringToList(req.query?.subjects);
  const ratings = queryStringToList(req.query?.ratings);
  const name = req.query?.name;

  const tutors = await tutorService.getTutors({
    page: page,
    limit: limit,
    subjects,
    name,
    ratings,
  });
  const json = parseDataWithMeta(tutors.rows, page, limit, tutors.count);
  sendResponse(res, 200, "Tutors retrieved successfully", json);
};

exports.getTutor = async (req, res) => {
  const tutor = await tutorService.getTutor(req.params.id);

  if (tutor === null) {
    throw new ApiError("Tutor not found", 404);
  }
  sendResponse(res, 200, "success", tutor);
};

exports.createTutor = async (req, res) => {
  const userId = req.user.id;
  const profile = {
    ...req.body,
    approvalStatus: "pending",
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
    userId: userId,
    documentKey,
  });

  await trackEvent(eventTypes.USER_ONBOARDED, {
    userId: userId,
    email: newTutor.user.email,
    role: newTutor.user.role,
    fullName: `${newTutor.user.firstName} ${newTutor.user.lastName}`,
  });

  await addStreamUser({
    id: userId,
    email: newTutor.user.email,
    role: newTutor.user.role,
    profileImageUrl: newTutor.user.profileImageUrl,
    firstName: newTutor.user.firstName,
    lastName: newTutor.user.lastName,
  });

  await sendSlackNotification("tutor_onboarded", {
    name: `${newTutor.user.firstName} ${newTutor.user.lastName}`,
    email: newTutor.user.email,
  });

  await sendAdminTutorOnboardingNotification({
    adminEmail: "althubteam29@gmail.com",
    tutorName: `${newTutor.user.firstName} ${newTutor.user.lastName}`,
    tutorEmail: newTutor.user.email,
    tutorId: userId,
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

  // await addStreamUser({
  //   id: tutorId,
  //   email: updatedTutorProfile.user.email,
  //   role: updatedTutorProfile.user.role,
  //   profileImageUrl: updatedTutorProfile.user.profileImageUrl,
  //   firstName: updatedTutorProfile.user.firstName,
  //   lastName: updatedTutorProfile.user.lastName,
  // });
  sendResponse(res, 200, "success", updatedTutorProfile);
};

exports.getTutorRecommendations = async (req, res) => {
  const userId = req.user.id;

  const page = req.query.page ?? 1;
  const limit = req.query.limit ?? 10;
  const tutorRecommendations = await tutorService.getTutorRecommendations({
    userId,
    page,
    limit,
  });
  const json = parseDataWithMeta(
    tutorRecommendations.rows,
    page,
    limit,
    tutorRecommendations.count
  );

  sendResponse(res, 200, "success", json);
};
