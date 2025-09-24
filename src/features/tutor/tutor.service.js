const ApiError = require("@utils/apiError");
const { where, Op } = require("sequelize");
const { Subject, User, Tutor, Student } = require("@models");
const sequelize = require("@src/shared/database");
const { required } = require("joi");
const { uploadFileToS3 } = require("@src/shared/utils/s3Upload");

exports.createTutor = async ({ profile, userId, file, documentKey }) => {
  const existing = await Tutor.findByPk(userId);
  if (existing) {
    throw new ApiError("Tutor profile already exists", 409);
  }

  // let documentData = {};
  // if (file) {
  //   documentData = await uploadFileToS3(file); // key only
  // }

  const newTutor = await Tutor.create({
    ...profile,
    // documentKey: documentData.key || null,
    documentKey: documentKey || null,
  });

  await addSubjectsToProfile({
    profile: newTutor,
    subjectIds: profile.subjects,
  });

  await User.update(
    { role: "tutor", isOnboarded: true },
    { where: { id: userId } }
  );

  return this.getTutor(userId);
};

exports.getTutor = async (userId) => {
  return await Tutor.scope("join").findByPk(userId);
};

exports.getTutors = async ({
  approvalStatus = "approved",
  profileVisibility = "active",
  subjects,
  availability,
  limit = 10,
  page = 1,
}) => {
  const subjectInclude = {
    model: Subject,
    as: "subjects",
  };
  if (subjects && subjects.length > 0) {
    subjectInclude.query = {
      [Op.in]: subjects,
    };
  }
  return await Tutor.scope("join").findAndCountAll({
    where: {
      approvalStatus,
      profileVisibility,
    },
    include: [subjectInclude],
    limit: limit,
    offset: (page - 1) * limit,
  });
};

exports.getTutorRecommendations = async ({ userId, limit = 10, page = 1 }) => {
  const student = await Student.findOne({ where: { userId } });

  const subjects = await student.getSubjects();
  const subjectIds = subjects.map((subject) => subject.id);

  const recommendedTutors = await Tutor.scope("join").findAndCountAll({
    where: {
      approvalStatus: "approved",
      profileVisibility: "active",
    },
    include: [
      {
        model: Subject,
        as: "subjects",
        where: { id: { [Op.in]: subjectIds } },
      },
    ],
    limit: limit,
    offset: (page - 1) * limit,
  });

  if (recommendedTutors.count === 0) {
    return await Tutor.scope("join").findAndCountAll({
      where: {
        approvalStatus: "approved",
        profileVisibility: "active",
      },
      include: [{ model: Subject, as: "subjects" }],
      limit: limit,
      offset: (page - 1) * limit,
    });
  }

  return recommendedTutors;
};
exports.updateTutorProfile = async ({ id, tutorProfile }) => {
  const [count, [newTutorProfile]] = await Tutor.update(tutorProfile, {
    where: { user_id: id },
    returning: true,
  });

  if (count === 0) {
    throw new ApiError(
      "Tutor profile does not exist",
      404,
      "Tutor profile not found"
    );
  }

  await addSubjectsToProfile({
    profile: newTutorProfile,
    subjectIds: tutorProfile.subjects,
  });
  return await this.getTutor(id);
};

exports.getTutorAvailability = async ({ id, startTime, endTime }) => {};

exports.updateTutorAvailability = async ({ id, availability }) => {};

async function addSubjectsToProfile({ profile, subjectIds }) {
  if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
    return;
  }

  const selectedSubjects = await Subject.findAll({
    where: {
      id: {
        [Op.in]: subjectIds,
      },
    },
  });

  await profile.setSubjects(selectedSubjects);
}
