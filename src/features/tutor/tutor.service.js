const Tutor = require("./tutor.model")();
const User = require("../user/user.model")();
const { default: status } = require("http-status");
const ApiError = require("../../shared/utils/apiError");
const { where } = require("sequelize");
const Subject = require("../../shared/database/models/subject");
const sequelize = require("../../shared/database");

exports.createTutor = async ({ tutor }) => {
  const newTutor = await Tutor.create(tutor);
  newTutor.setSubjects(tutor.subjects || []);


  return newTutor;
};

exports.getTutor = async (userId) => {
  return await Tutor.findByPk(userId);
};

exports.getTutors = async ({
  approvalStatus = "approved",
  profileVisibility = "active",
  subjects,
  availability,
  limit = 10,
  page = 1,
}) => {

  return await sequelize.query(
    `SELECT t.*, s.name as subject_name
     FROM tutor_profiles t
     INNER JOIN tutor_subjects ts ON t.user_id = ts.tutor_user_id
     INNER JOIN subjects s ON ts.subject_id = s.id
     WHERE t.approval_status = :approvalStatus
       AND t.profile_visibility = :profileVisibility
       AND s.name IN (:subjects)
     LIMIT :limit OFFSET :offset`,
    {
      replacements: {
        approvalStatus,
        profileVisibility,
        subjects,
        limit,
        offset: (page - 1) * limit,
      },
      type: sequelize.QueryTypes.SELECT,
    }
  );
  // return await Tutor.findAndCountAll({
  //   where: {
  //     approvalStatus,
  //     profileVisibility,
  //   },
  //   include: [Subject],
  //   limit: limit,
  //   offset: (page - 1) * limit,
  // });
};

exports.updateTutorProfile = async ({ id, tutorProfile }) => {
  return await Tutor.update(tutorProfile, {
    where: { user_id: id },
    returning: true,
  });
};

exports.deleteTutorProfile = async (id) => {
  return await Tutor.destroy({ where: { user_id: id }, returning: true });
};

exports.getTutorAvailability = async ({ id, startTime, endTime }) => {};

exports.updateTutorAvailability = async ({ id, availability }) => {};
