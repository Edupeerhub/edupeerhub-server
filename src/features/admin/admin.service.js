const { User, Tutor, Student, Admin } = require("@src/shared/database/models");
const { Op } = require("sequelize");
const { getSignedFileUrl } = require("@src/shared/S3/s3Service");
const ApiError = require("@utils/apiError");
const { hashPassword, generateRandomAvatar } = require("@utils/authHelpers");

const TUTOR_INCLUDES = [
  {
    model: Tutor,
    as: "tutor",
    attributes: [
      "bio",
      "approvalStatus",
      "profileVisibility",
      "education",
      "rejectionReason",
    ],
  },
];

const STUDENT_INCLUDES = [
  {
    model: Student,
    as: "student",
    attributes: ["gradeLevel", "learningGoals"],
  },
];

// =====================
// User Operations
// =====================

exports.getUsers = async (query) => {
  const {
    page = 1,
    limit = 10,
    sort_by = "createdAt",
    order = "desc",
    role,
  } = query;

  const roleValue = role ? String(role).toLowerCase() : null;
  const isTutor = roleValue === "tutor";
  const isStudent = roleValue === "student";

  const filter = {};
  const offset = (Number(page) - 1) * Number(limit);

  // Role filtering
  const includes = [];
  if (isTutor) {
    filter.role = "tutor";
    includes.push(...TUTOR_INCLUDES);
  }
  if (isStudent) {
    filter.role = "student";
    includes.push(...STUDENT_INCLUDES);
  }

  const users = await User.scope("includeDeleted").findAll({
    where: filter,
    include: includes.length > 0 ? includes : undefined,
    limit: Number(limit),
    offset,
    order: [[sort_by, order.toLowerCase() === "asc" ? "ASC" : "DESC"]],
  });

  const totalUsers = await User.scope("includeDeleted").count({
    where: filter,
  });
  const totalPages = Math.ceil(totalUsers / Number(limit));

  return {
    data: users,
    meta: {
      page: page,
      count: totalUsers,
      limit: limit,
      total: totalPages,
    },
  };
};

exports.getUser = async (id) => {
  const user = await User.unscoped().findByPk(id, {
    paranoid: false,
    attributes: [
      "id",
      "email",
      "firstName",
      "lastName",
      "profileImageUrl",
      "role",
      "isVerified",
      "isOnboarded",
      "accountStatus",
      "suspendedAt",
      "suspensionReason",
      "deletedAt",
      "createdAt",
      "lastLogin",
    ],
    include: [...STUDENT_INCLUDES, ...TUTOR_INCLUDES],
  });

  if (!user) throw new ApiError("User not found", 404);

  const userData = user.toJSON();
  ["tutor", "student"].forEach((assoc) => {
    if (!userData[assoc]) delete userData[assoc];
  });

  return userData;
};

// exports.getUserCounts = async () => {
//   const totalTutors = await User.count({
//     where: { role: "tutor" },
//   });

//   const totalStudents = await User.count({
//     where: { role: "student" },
//   });

//   const totalPendingTutors = await Tutor.count({
//     where: { approvalStatus: "pending" },
//   });

//   return {
//     totalTutors,
//     totalStudents,
//     totalPendingTutors,
//   };
// };

/**
 * Calculates total counts and percentage changes for users and tutors.
 * @param {"day"|"week"|"month"} range - Time period for comparison (default: "week")
 */
exports.getUserCounts = async (range = "week") => {
  const now = new Date();

  // --- Determine time windows ---
  const startOfThisPeriod = new Date(now);
  const startOfLastPeriod = new Date(now);

  if (range === "day") {
    startOfThisPeriod.setDate(now.getDate() - 1);
    startOfLastPeriod.setDate(now.getDate() - 2);
  } else if (range === "month") {
    startOfThisPeriod.setMonth(now.getMonth() - 1);
    startOfLastPeriod.setMonth(now.getMonth() - 2);
  } else {
    // default: week
    startOfThisPeriod.setDate(now.getDate() - 7);
    startOfLastPeriod.setDate(now.getDate() - 14);
  }

  // --- CURRENT TOTALS ---
  const [totalTutors, totalStudents, totalPendingTutors] = await Promise.all([
    User.count({ where: { role: "tutor" } }),
    User.count({ where: { role: "student" } }),
    Tutor.unscoped().count({ where: { approvalStatus: "pending" } }),
  ]);

  // --- CURRENT PERIOD CREATIONS ---
  const [
    newTutorsThisPeriod,
    newStudentsThisPeriod,
    newPendingTutorsThisPeriod,
  ] = await Promise.all([
    User.count({
      where: { role: "tutor", createdAt: { [Op.gte]: startOfThisPeriod } },
    }),
    User.count({
      where: { role: "student", createdAt: { [Op.gte]: startOfThisPeriod } },
    }),
    Tutor.count({
      where: {
        approvalStatus: "pending",
        createdAt: { [Op.gte]: startOfThisPeriod },
      },
    }),
  ]);

  // --- PREVIOUS PERIOD CREATIONS ---
  const [
    newTutorsLastPeriod,
    newStudentsLastPeriod,
    newPendingTutorsLastPeriod,
  ] = await Promise.all([
    User.count({
      where: {
        role: "tutor",
        createdAt: { [Op.between]: [startOfLastPeriod, startOfThisPeriod] },
      },
    }),
    User.count({
      where: {
        role: "student",
        createdAt: { [Op.between]: [startOfLastPeriod, startOfThisPeriod] },
      },
    }),
    Tutor.count({
      where: {
        approvalStatus: "pending",
        createdAt: { [Op.between]: [startOfLastPeriod, startOfThisPeriod] },
      },
    }),
  ]);

  // --- HELPER: Safe percentage change function ---
  const calcGrowth = (current, previous) => {
    if (previous === 0 && current > 0) return 100;
    if (previous === 0 && current === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // --- CALCULATE GROWTH ---
  const tutorGrowth = calcGrowth(newTutorsThisPeriod, newTutorsLastPeriod);
  const studentGrowth = calcGrowth(
    newStudentsThisPeriod,
    newStudentsLastPeriod
  );
  const pendingTutorGrowth = calcGrowth(
    newPendingTutorsThisPeriod,
    newPendingTutorsLastPeriod
  );

  return {
    totals: {
      totalTutors,
      totalStudents,
      totalPendingTutors,
    },
    growth: {
      tutors: Number(tutorGrowth.toFixed(1)),
      students: Number(studentGrowth.toFixed(1)),
      pendingTutors: Number(pendingTutorGrowth.toFixed(1)),
    },
    periods: {
      range,
      thisPeriod: {
        newTutors: newTutorsThisPeriod,
        newStudents: newStudentsThisPeriod,
        newPendingTutors: newPendingTutorsThisPeriod,
      },
      lastPeriod: {
        newTutors: newTutorsLastPeriod,
        newStudents: newStudentsLastPeriod,
        newPendingTutors: newPendingTutorsLastPeriod,
      },
    },
  };
};

exports.restoreUser = async (id) => {
  const user = await User.findByPk(id, { paranoid: false });
  if (user && user.deletedAt) {
    await user.restore();
  }

  return user;
};

// =====================
// Pending Tutor Operations
// =====================

exports.getAllPendingTutors = async () => {
  const pendingTutors = await Tutor.findAll({
    where: { approvalStatus: "pending" },
    include: [
      {
        model: User,
        as: "user",
        attributes: [
          "id",
          "firstName",
          "lastName",
          "email",
          "profileImageUrl",
          "role",
          "isVerified",
          "isOnboarded",
          "accountStatus",
          "createdAt",
        ],
      },
    ],
  });
  return pendingTutors;
};

exports.getTutor = async (id, includeSignedUrl = false) => {
  const tutor = await Tutor.findByPk(id, {
    attributes: { include: ["documentKey"] },
    include: [
      {
        model: User,
        as: "user",
        attributes: [
          "firstName",
          "lastName",
          "email",
          "profileImageUrl",
          "role",
          "isVerified",
          "isOnboarded",
          "accountStatus",
          "createdAt",
        ],
      },
    ],
  });

  if (!tutor) throw new ApiError("Tutor not found", 404);

  const tutorJson = tutor.toJSON();

  const { documentKey, ...safeTutorJson } = tutorJson;

  if (includeSignedUrl && documentKey) {
    safeTutorJson.documentUrl = await getSignedFileUrl(documentKey);
  }

  return safeTutorJson;
};

exports.getTutorDocument = async (userId) => {
  const tutor = await Tutor.findOne({
    where: { userId },
    attributes: { include: ["documentKey"] },
  });
  if (!tutor?.documentKey)
    throw new ApiError("Tutor document key not found", 404);

  const signedUrl = await getSignedFileUrl(tutor.documentKey);
  return { signedUrl };
};

exports.approveTutor = async (id) => {
  const tutor = await Tutor.findByPk(id);
  if (!tutor) throw new ApiError("Tutor not found", 404);

  tutor.approvalStatus = "approved";
  await tutor.save();
  return tutor;
};

exports.rejectTutor = async (id, rejectionReason) => {
  const tutor = await Tutor.findByPk(id);
  if (!tutor) throw new ApiError("Tutor not found", 404);

  tutor.approvalStatus = "rejected";
  tutor.rejectionReason = rejectionReason;

  await tutor.save();
  return tutor;
};

// =====================
// Super Admin Operations
// =====================

exports.getAllAdmins = async () => {
  const admins = await Admin.findAll({
    attributes: ["isSuperAdmin"],
    include: [
      {
        model: User,
        as: "user",
        attributes: [
          "id",
          "firstName",
          "lastName",
          "email",
          "role",
          "profileImageUrl",
          "accountStatus",
          "suspendedAt",
          "suspensionReason",
        ],
      },
    ],
  });
  return admins;
};

exports.createAdmin = async (adminData) => {
  const { firstName, lastName, email, password, isSuperAdmin } = adminData;

  const existingAdmin = await User.findOne({ where: { email } });
  if (existingAdmin)
    throw new ApiError("Admin with this email already exists", 400);

  const randomAvatar = generateRandomAvatar(firstName, lastName);

  const newAdmin = await User.create(
    {
      firstName,
      lastName,
      email,
      passwordHash: password,
      profileImageUrl: randomAvatar,
      role: "admin",
      isVerified: true,
      isOnboarded: true,
      admin: {
        isSuperAdmin: isSuperAdmin ?? false,
      },
    },
    {
      include: [{ model: Admin, as: "admin" }],
    }
  );

  return newAdmin;
};
