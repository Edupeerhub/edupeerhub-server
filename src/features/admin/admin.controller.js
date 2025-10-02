const sendResponse = require("@utils/sendResponse");
const {
  sendApprovalEmail,
  sendRejectionEmail,
} = require("@src/shared/email/email.service");
const adminService = require("./admin.service");

// =====================
// User Operations
// =====================

exports.getAllUsers = async (req, res, next) => {
  try {
    // use query params to get by tutor or students, just deleted, suspended, onboarded or all users
    const users = await adminService.getUsers(req.query);
    sendResponse(res, 200, "All users fetched successfully", users);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUser(req.params.id);
    sendResponse(res, 200, "User fetched successfully", user);
  } catch (error) {
    next(error);
  }
};

exports.restoreUser = async (req, res, next) => {
  try {
    const user = await adminService.restoreUser(req.params.id);
    sendResponse(res, 200, "User restored successfully", user);
  } catch (error) {
    next(error);
  }
};

exports.getUserSummaryCounts = async (req, res, next) => {
  try {
    const counts = await adminService.getUserCounts();
    sendResponse(res, 200, "User summary counts fetched successfully", counts);
  } catch (error) {
    next(error);
  }
};

// =====================
// Pending Tutor Operations
// =====================

exports.getPendingTutors = async (req, res, next) => {
  try {
    const tutors = await adminService.getAllPendingTutors();
    sendResponse(res, 200, "Pending tutors fetched successfully", tutors);
  } catch (error) {
    next(error);
  }
};

exports.getPendingTutorById = async (req, res, next) => {
  try {
    const includeSignedUrl = true;
    const tutor = await adminService.getTutor(req.params.id, {
      includeSignedUrl,
    });
    sendResponse(res, 200, "Pending tutor fetched successfully", tutor);
  } catch (error) {
    next(error);
  }
};

exports.getTutorDocument = async (req, res, next) => {
  try {
    const { signedUrl } = await adminService.getTutorDocument(req.params.id);
    sendResponse(res, 200, "Tutor document fetched successfully", {
      documentUrl: signedUrl,
    });
  } catch (err) {
    next(err);
  }
};

exports.approveTutor = async (req, res, next) => {
  try {
    const tutor = await adminService.approveTutor(req.params.id);
    await sendApprovalEmail(tutor.user.email, tutor.user.firstName);
    sendResponse(res, 200, "Tutor approved successfully", tutor);
  } catch (error) {
    next(error);
  }
};

exports.rejectTutor = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const tutor = await adminService.rejectTutor(
      req.params.id,
      rejectionReason
    );
    await sendRejectionEmail(
      tutor.user.email,
      tutor.user.firstName,
      tutor.rejectionReason
    );
    sendResponse(res, 200, "Tutor rejected successfully", tutor);
  } catch (error) {
    next(error);
  }
};

// =====================
// Super Admin Operations
// =====================

exports.createAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, isSuperAdmin } = req.body;

    const newAdmin = await adminService.createAdmin({
      firstName,
      lastName,
      email,
      password,
      isSuperAdmin,
    });

    const result = {
      id: newAdmin.id,
      email: newAdmin.email,
      fullName: `${newAdmin.firstName} ${newAdmin.lastName}`,
      isSuperAdmin: newAdmin.isSuperAdmin,
      role: newAdmin.role,
      profileImageUrl: newAdmin.profileImageUrl,
      createdAt: newAdmin.createdAt,
    };

    sendResponse(res, 200, "Admin created successfully", result);
  } catch (error) {
    next(error);
  }
};

exports.getAllAdmins = async (req, res, next) => {
  try {
    const admins = await adminService.getAllAdmins();
    sendResponse(res, 200, "All admins fetched successfully", admins);
  } catch (error) {
    next(error);
  }
};
