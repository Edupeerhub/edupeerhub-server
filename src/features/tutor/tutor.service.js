const Tutor = require("./tutor.model")();
const User = require("../user/user.model")();
const { default: status } = require("http-status");
const ApiError = require("../../shared/utils/apiError");
const { where } = require("sequelize");

exports.createTutor = async ({ tutor }) => {
  const newTutor = await Tutor.create(tutor);

  return newTutor;
};

exports.getTutor = async (userId) => {
  return await Tutor.findByPk(userId);
};

//TODO: identify allowable filters
exports.getTutors = async ({
  approvalStatus = "approved",
  profileVisibility = "active",
  limit = 10,
  page = 1,
}) => {
  return await Tutor.findAndCountAll({
    where: {
      approvalStatus,
      profileVisibility,
    },
    limit: limit,
    offset: (page - 1) * limit,
  });
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

exports.getTutorAvailability = async ({id, startTime, endTime}) => {

};

exports.updateTutorAvailability = async ({ id, availability }) => {};
