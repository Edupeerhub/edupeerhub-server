const ApiError = require("../../shared/utils/apiError");
const { where, Op } = require("sequelize");
const { Subject, User, Tutor } = require("../../shared/database/models");
const sequelize = require("../../shared/database");

exports.createTutor = async ({ profile, userId }) => {
  const newTutor = await Tutor.create(profile);
  await User.update({ role: "tutor" }, { where: { id: userId } });

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
  const query = {};

  if (subjects && subjects.length > 0) {
    query.name = {
      [Op.in]: subjects,
    };
  }
  return await Tutor.findAndCountAll({
    where: {
      approvalStatus,
      profileVisibility,
    },
    include: [
      {
        model: Subject,
        as: "subjects",
        // where: query,
      },
    ],
    limit: limit,
    offset: (page - 1) * limit,
  });
};

exports.updateTutorProfile = async ({ id, tutorProfile }) => {
  let [count, [newTutorProfile]] = await Tutor.update(tutorProfile, {
    where: { user_id: id },
    returning: true,
  });

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
