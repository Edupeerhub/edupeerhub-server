const { User, Tutor, Student, Admin } = require("@src/shared/database/models");
const { getSignedFileUrl } = require("@src/shared/utils/s3Upload");
const ApiError = require("@utils/apiError");
const { hashPassword, generateRandomAvatar } = require("@utils/authHelpers");

const TUTOR_INCLUDES = [
  {
    model: Tutor,
    as: "tutor",
    attributes: [
      "bio",
      "rating",
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
  const { page = 1, limit = 10, sort_by = "createdAt", order = "desc" } = query;

  const tutorFlag = query.tutor === "true" || query.tutor === "";
  const studentFlag = query.student === "true" || query.student === "";

  const filter = {};
  const offset = (Number(page) - 1) * Number(limit);

  // Role filtering
  if (tutorFlag && !studentFlag) filter.role = "tutor";
  if (studentFlag && !tutorFlag) filter.role = "student";

  const includes = [];
  if (tutorFlag) {
    includes.push(...TUTOR_INCLUDES);
  }
  if (studentFlag) {
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
    users,
    pagination: {
      totalItems: totalUsers,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: totalPages,
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
        attributes: ["id", "firstName", "lastName", "email", "role"],
      },
    ],
  });
  return pendingTutors;
};

exports.getTutor = async (id, includeSignedUrl = true) => {
  const tutor = await Tutor.findByPk(id, {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["firstName", "lastName", "email", "role"],
      },
    ],
  });

  const tutorJson = tutor.toJSON();
  // if (includeSignedUrl && tutorJson.documentKey) {
  //   tutorJson.signedDocumentUrl = await getSignedFileUrl(tutorJson.documentKey);
  // }

  if (includeSignedUrl && tutorJson.documentKey) {
    const AWS = require("aws-sdk");
    const s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: tutorJson.documentKey,
      Expires: 5 * 60,
    };
    tutorJson.signedDocumentUrl = s3.getSignedUrl("getObject", params);
  }

  return tutorJson;
};

exports.getTutorDocument = async (userId) => {
  const tutor = await Tutor.findOne({ where: { userId } });
  if (!tutor?.documentKey) throw new ApiError("Tutor document not found", 404);

  const signedUrl = await getSignedFileUrl(tutor.documentKey);
  return { signedUrl };
};

exports.approveTutor = async (id) => {
  const tutor = await exports.getTutor(id);
  if (!tutor) throw new ApiError("Tutor not found", 404);

  tutor.approvalStatus = "approved";
  await tutor.save();
  return tutor;
};

exports.rejectTutor = async (id, rejectionReason) => {
  const tutor = await exports.getTutor(id);
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

  const hashedPassword = await hashPassword(password);
  const randomAvatar = generateRandomAvatar(firstName, lastName);

  const newAdmin = await User.create(
    {
      firstName,
      lastName,
      email,
      passwordHash: hashedPassword,
      profileImageUrl: randomAvatar,
      role: "admin",
      isVerified: true,
      isOnboarded: true,
      admin: {
        isSuperAdmin: isSuperAdmin || false,
      },
    },
    {
      include: [{ model: Admin, as: "admin" }],
    }
  );

  return newAdmin;
};
