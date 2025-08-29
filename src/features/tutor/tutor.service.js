const ApiError = require("../../shared/utils/apiError");
const { where, Op } = require("sequelize");
const {
  Subject,
  User,
  Tutor,
  Student,
} = require("../../shared/database/models");
const sequelize = require("../../shared/database");
const { required } = require("joi");

exports.createTutor = async ({ profile, userId }) => {
  const newTutor = await Tutor.create(profile);
  await User.update(
    { role: "tutor", isOnboarded: true },
    { where: { id: userId } }
  );

  return newTutor;
};

exports.getTutor = async (userId) => {
  return await Tutor.findByPk(userId, {
    include: [
      {
        model: Subject,
        as: "subjects",
      },
    ],
  });
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
  return await Tutor.findAndCountAll({
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
  return await Tutor.findAndCountAll({
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
  let [count, [newTutorProfile]] = await Tutor.update(tutorProfile, {
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
  const subjectIds = tutorProfile?.subjects?.map((subject) => subject.id);

  if (!Array.isArray(subjectIds)) {
    return newTutorProfile;
  }

  const selectedSubjects = await Subject.findAll({
    where: {
      id: {
        [Op.in]: subjectIds,
      },
    },
  });

  await newTutorProfile.setSubjects(selectedSubjects);
  newTutorProfile = await this.getTutor(id);
  return newTutorProfile;
};

exports.deleteTutorProfile = async (id) => {
  return await Tutor.destroy({ where: { user_id: id }, returning: true });
};

exports.getTutorAvailability = async ({ id, startTime, endTime }) => {};

exports.updateTutorAvailability = async ({ id, availability }) => {};
