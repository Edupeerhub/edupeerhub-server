const sendResponse = require("../../shared/utils/sendResponse");
const tutorService = require("./tutor.service");
const { status } = require("http-status");
exports.getTutors = async (req, res, next) => {
  try {
    const tutors = await tutorService.getTutors;
    sendResponse(res, 200, "Tutors retrieved successfully", tutors);
  } catch (error) {
    next(error);
  }
};

exports.getTutor = async (req, res, next) => {};

exports.createTutor = async (req, res, next) => {};

exports.updateTutor = async (req, res, next) => {};

exports.getTutorSchedule = async (req, res, next) => {};

exports.getTutorAvailability = async (req, res, next) => {};

exports.updateAvailability = async (req, res, next) => {};

exports.deleteAvailability = async (req, res, next) => {};
