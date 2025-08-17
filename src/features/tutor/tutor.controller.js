const sendResponse = require("../../shared/utils/sendResponse");
const tutorService = require("./tutor.service");
;
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

  sendResponse(res, 200, "success", tutor);
};

exports.createTutor = async (req, res, next) => {
  const tutor = {
    ...req.body,
    userId: req.user.id,
  };
  const newTutor = await tutorService.createTutor({ tutor });

  sendResponse(res, 201, "created successfully", newTutor);
};

exports.updateTutor = async (req, res, next) => {
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

exports.getTutorSchedule = async (req, res, next) => {};

exports.getTutorAvailability = async (req, res, next) => {};

exports.updateAvailability = async (req, res, next) => {};

exports.deleteAvailability = async (req, res, next) => {};
