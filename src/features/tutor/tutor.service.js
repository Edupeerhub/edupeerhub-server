const ApiError = require("@utils/apiError");
const { where, Op, literal } = require("sequelize");
const { Subject, User, Tutor, Student } = require("@models");
const sequelize = require("@src/shared/database");
const { required } = require("joi");
const parseDataWithMeta = require("@src/shared/utils/meta");

exports.createTutor = async ({ profile, userId, documentKey }) => {
  const existing = await Tutor.findByPk(userId);
  if (existing) {
    throw new ApiError("Tutor profile already exists", 409);
  }

  const newTutor = await Tutor.create({
    ...profile,
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
  name,
  ratings,
  limit = 10,
  page = 1,
}) => {
  const includes = [];
  let where = {
    approvalStatus,
    profileVisibility,
  };

  // Subjects
  includes.push({
    model: Subject.scope("join"),
    as: "subjects",
    through: { attributes: [] },
  });

  if (subjects && subjects.length > 0) {
    where.userId = {
      [Op.in]: sequelize.literal(`(
        SELECT tutor_user_id
        FROM tutor_subjects
        WHERE subject_id IN (${subjects.map(Number).join(",")})
      )`),
    };
  }

  //Name
  if (name) {
    const searchWords = name.split(" ");

    const conditions = searchWords.map((word) => ({
      [Op.or]: [
        { first_name: { [Op.iLike]: `%${word}%` } },
        { last_name: { [Op.iLike]: `%${word}%` } },
      ],
    }));

    const nameInclude = {
      model: User.scope("join"),
      as: "user",
      where: conditions,
    };
    includes.push(nameInclude);
  }

  //Ratings
  //   const where = {
  //   status: 'active',
  //   funding: 'funded',
  // };

  // await sequelize.query(sql`SELECT * FROM projects WHERE ${sql.where(where)}`);
  if (ratings && ratings.length > 0) {
    const ratingWhere = sequelize.where(
      sequelize.fn("ROUND", sequelize.col("rating")),
      {
        [Op.in]: ratings,
      }
    );
    where = {
      [Op.and]: [
        ...Object.entries(where).map(([key, value]) => ({ [key]: value })),
        ratingWhere,
      ],
    };
  }

  return await Tutor.scope("join").findAndCountAll({
    where: where,
    include: includes,
    limit: limit,
    offset: (page - 1) * limit,
    distinct: true,
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
    distinct: true,
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
      distinct: true,
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
