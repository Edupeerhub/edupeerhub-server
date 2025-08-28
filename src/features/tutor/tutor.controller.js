const sendResponse = require("@utils/sendResponse");
const tutorService = require("./tutor.service");

const queryStringToList = require("@utils/listInQuery");
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
    sendResponse(res, 404, "Tutor not found");
    return;
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
    sendResponse(res, 403, "forbidden");
    return;
  }
  const updatedTutorProfile = await tutorService.updateTutorProfile({
    id: tutorId,
    tutorProfile,
  });

  sendResponse(res, 200, "success", updatedTutorProfile);
};

exports.getTutorSchedule = async (req, res) => {};

exports.getTutorAvailability = async (req, res) => {};

exports.updateAvailability = async (req, res) => {};

exports.deleteAvailability = async (req, res) => {};
