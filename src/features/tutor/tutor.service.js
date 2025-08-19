const ApiError = require("../../shared/utils/apiError");
const { where, Op } = require("sequelize");
const { Subject, User, Tutor } = require("../../shared/database/models");
const sequelize = require("../../shared/database");

exports.createTutor = async ({ tutor }) => {
  const newTutor = await Tutor.create(tutor);

  return newTutor;
};

exports.getTutor = async (userId) => {
  return await Tutor.findByPk(userId, {
    include: [
      {
        model: Subject,
        as: "subjects",
        // attributes: ["id", "name", "description"],
        attributes: {exclude: ["tutor_subjects"]}
        
        // Uncomment the next line if you want to exclude the
        // through: { attributes: [] },
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
  // return await sequelize.query(
  //   `SELECT t.*, s.name as subject_name
  //    FROM tutor_profiles t
  //    INNER JOIN tutor_subjects ts ON t.user_id = ts.tutor_user_id
  //    INNER JOIN subjects s ON ts.subject_id = s.id
  //    WHERE
  //   --  t.approval_status = :approvalStatus
  //   --    AND t.profile_visibility = :profileVisibility
  //     --  AND
  //       s.name IN (:subjects)
  //    LIMIT :limit OFFSET :offset`,
  //   {
  //     replacements: {
  //       approvalStatus,
  //       profileVisibility,
  //       subjects,
  //       limit,
  //       offset: (page - 1) * limit,
  //     },
  //     type: sequelize.QueryTypes.SELECT,
  //   }
  // );
  const query = {};

  if (subjects && subjects.length >0 ) {
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
  newTutorProfile  = await this.getTutor(id);
  return newTutorProfile;
};

exports.deleteTutorProfile = async (id) => {
  return await Tutor.destroy({ where: { user_id: id }, returning: true });
};

exports.getTutorAvailability = async ({ id, startTime, endTime }) => {};

exports.updateTutorAvailability = async ({ id, availability }) => {};
