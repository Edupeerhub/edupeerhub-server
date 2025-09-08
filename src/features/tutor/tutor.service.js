const ApiError = require("@utils/apiError");
const { where, Op } = require("sequelize");
const { Subject, User, Tutor, Student } = require("@models");
const sequelize = require("@src/shared/database");
const { required } = require("joi");

exports.createTutor = async ({ profile, userId }) => {
  const newTutor = await Tutor.create(profile);

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
      approvalStatus: "approved",
      profileVisibility: "active",
    },
    include: [subjectInclude],
    limit: limit,
    offset: (page - 1) * limit,
  });
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

exports.deleteTutorProfile = async (id) => {
  // const tutor = await Tutor.findByPk(id);
  // return await tutor.destroy()
  return await Tutor.destroy({
    where: {
      userId: id,
    },
  });
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
