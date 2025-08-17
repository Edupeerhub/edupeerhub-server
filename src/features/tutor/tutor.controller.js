const sendResponse = require("../../shared/utils/sendResponse");
const tutorService = require("./tutor.service");
const { status } = require("http-status");
exports.getTutors = async (req, res, next) => {
  try {
    //params
    const page = req.query?.page ?? 1;
    const limit = req.query?.limit ?? 10;

    //filters
    const subjects = req.query.subjects?.split(",");
    const availability = req.query.availability?.split(",");
    const ratings = req.query.rating?.split(",");

    const tutors = await tutorService.getTutors({
      page: page,
      limit: limit,
      subjects,
      availability,
      ratings,
    });
    sendResponse(res, 200, "Tutors retrieved successfully", tutors);
  } catch (error) {
    next(error);
  }
};

exports.getTutor = async (req, res, next) => {
  const tutor = await tutorService.getTutor(req.params.id);

  sendResponse(res, status.OK, status["200_NAME"], tutor);
};

exports.createTutor = async (req, res, next) => {
  const tutor = {
    ...req.body,
    userId: req.user.id,
  };
  const newTutor = await tutorService.createTutor({ tutor });

  sendResponse(res, status.CREATED, status["201_NAME"], newTutor);
};

exports.updateTutor = async (req, res, next) => {
  const tutorId = req.params.id;
  const tutorProfile = req.body;

  if (tutorId !== req.user.id) {
    sendResponse(res, status.FORBIDDEN, status["403_NAME"]);
    return;
  }
  const updatedTutorProfile = await tutorService.updateTutorProfile({
    id: tutorId,
    tutorProfile,
  });

  sendResponse(res, status.OK, status["200_NAME"], updatedTutorProfile);
};

exports.getTutorSchedule = async (req, res, next) => {};

exports.getTutorAvailability = async (req, res, next) => {};

exports.updateAvailability = async (req, res, next) => {};

exports.deleteAvailability = async (req, res, next) => {};
