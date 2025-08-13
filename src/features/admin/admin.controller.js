const sendResponse = require("../../shared/utils/sendResponse");

exports.getPendingTutors = async (req, res, next) => {
  try {
    sendResponse(res, 200, "Pending tutors fetched successfully", []);
  } catch (error) {
    next(error);
  }
};

exports.getPendingTutorById = async (req, res, next) => {
  try {
    sendResponse(res, 200, "Pending tutor fetched successfully", {});
  } catch (error) {
    next(error);
  }
};

exports.approveTutor = async (req, res, next) => {
  try {
    sendResponse(res, 200, "Tutor approved successfully", {});
  } catch (error) {
    next(error);
  }
};

exports.rejectTutor = async (req, res, next) => {
  try {
    sendResponse(res, 200, "Tutor rejected successfully", {});
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    sendResponse(res, 200, "All users fetched successfully", []);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    sendResponse(res, 200, "User fetched successfully", {});
  } catch (error) {
    next(error);
  }
};

exports.getAllTutors = async (req, res, next) => {
  try {
    sendResponse(res, 200, "All tutors fetched successfully", []);
  } catch (error) {
    next(error);
  }
};

exports.getAllStudents = async (req, res, next) => {
  try {
    sendResponse(res, 200, "All students fetched successfully", []);
  } catch (error) {
    next(error);
  }
};

exports.createAdmin = async (req, res, next) => {
  try {
    sendResponse(res, 200, "Admin created successfully", {});
  } catch (error) {
    next(error);
  }
};

exports.getAllAdmins = async (req, res, next) => {
  try {
    sendResponse(res, 200, "All admins fetched successfully", []);
  } catch (error) {
    next(error);
  }
};
