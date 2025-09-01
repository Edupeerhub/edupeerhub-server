const { Student, User, Subject, Exam, StudentSubject, StudentExam } = require("../../shared/database/models");
const sequelize = require("../../shared/database/index");
const ApiError = require("../../shared/utils/apiError");
const sendResponse = require ("../../shared/utils/sendResponse");
const { getStudentProfile } = require("./student.service");

// Helper to normalize learningGoals to JSON/text storage
function normalizeLearningGoals(lg) {
  if (Array.isArray(lg)) {
    return JSON.stringify(lg);
  }
  if (typeof lg === "string") {
    return lg;
  }
  return null;
}

exports.onboarding = async (req, res, next) => {
  const requestedId = req.params.id;
  const authenticatedId = req.user.id;

  if (requestedId !== authenticatedId) {
    return next(new ApiError("Forbidden - cannot onboard for another user", 403));
  }

  const { gradeLevel, learningGoals, subjects = [], exams = [] } = req.body;

  const transaction = await sequelize.transaction();

  try {
    // Update user role and isOnboarded
    await User.update(
      { role: "student", isOnboarded: true },
      { where: { id: authenticatedId }, transaction }
    );

    // Create student profile
    const student = await Student.create(
      {
        userId: authenticatedId,
        gradeLevel,
        learningGoals: normalizeLearningGoals(learningGoals),
      },
      { transaction }
    );

    // Create subject associations
    if (subjects && subjects.length) {
      const subjectCreates = subjects.map((subid) => ({ student_id: student.userId, subject_id: subid }));  // subid is exam id
      await StudentSubject.bulkCreate(subjectCreates, { transaction });
    }

    // Create exam associations
    if (exams && exams.length) {
      const examCreates = exams.map((exid) => ({ student_id: student.userId, exam_id: exid })); // exid is exam id
      await StudentExam.bulkCreate(examCreates, { transaction });
    }

    await transaction.commit();

    const created = await Student.findOne({
      where: { userId: authenticatedId },
      include: [
        { model: User, as: "user" },
        { model: Subject, as: "subjects" },
        { model: Exam, as: "exams" },
      ],
    });

    return res.status(201).json({ data: created });
  } catch (err) {
    await transaction.rollback();
    return next(err instanceof ApiError ? err : new ApiError(err.message, 500));
  }
};

exports.listStudents = async (req, res, next) => {
  try {
    const students = await Student.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ['id', 'firstName', 'lastName', 'profileImageUrl']
        }
      ],
      attributes: ['userId', 'gradeLevel'] 
    });

    // Processing results to create a flat structure with only essential fields
    const allStudents = students.map(studentInstance => {
      const studentData = studentInstance.toJSON(); // Convert Sequelize instance to plain object
      return {
        profileImageUrl: studentData.user?.profileImageUrl || null,
        userId: studentData.userId,
        firstName: studentData.user?.firstName || null,
        lastName: studentData.user?.lastName || null,
        gradeLevel: studentData.gradeLevel
      };
    });

    return res.status(200).json({ allStudents });
  } catch (err) {
    return next(err instanceof ApiError ? err : new ApiError(err.message, 500));
  }
};



exports.getStudent = async (req, res, next) => {
  try {
    // 1. Get the target user ID from request param
    const targetUserId = req.params.id;
    const authenticatedId = req.user.id;

    if (req.user.role !== 'admin' && authenticatedId !== targetUserId) {
      return next(new ApiError('Access denied - You can only view your own profile', 403));
    }
    const responseData = await getStudentProfile(targetUserId);
    
    sendResponse(res, 200, 'Student profile retrieved successfully', responseData);
  } catch (err) {
    return next(err instanceof ApiError ? err : new ApiError(err.message, 500));
  }
};



exports.updateStudent = async (req, res, next) => {
  const requestedId = req.params.id;
  const authenticatedId = req.user.id;

  if (requestedId !== authenticatedId && req.user.id !== "admin") {
    return next(new ApiError("Access denied - cannot update another student's profile", 403));
  }

  const { learningGoals, gradeLevel, profileImageUrl, subjects = [], exams = [] } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const student = await Student.findOne({ where: { userId: authenticatedId }, transaction });
    if (!student) {
      await transaction.rollback();
      return next(new ApiError("Student profile not found", 404));
    }

    // Find the associated user record
    const user = await User.findByPk(student.userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return next(new ApiError("Associated user not found", 500));
    }

    // Only update allowed fields
    if (learningGoals !== undefined) {
      student.learningGoals = normalizeLearningGoals(learningGoals);
      await student.save({ transaction });
    }

    if (gradeLevel !== undefined) {
      await student.update( {gradeLevel}, { transaction } )
    }

    if (profileImageUrl !== undefined) {
      await user.update({ profileImageUrl }, { transaction });
    }

    // Replace subjects
    if (subjects) {
      // Delete old associations
      await StudentSubject.destroy({ where: { student_id: student.userId }, transaction });
      if (subjects.length) {
        const subjectCreates = subjects.map((sid) => ({ student_id: student.userId, subject_id: sid }));
        await StudentSubject.bulkCreate(subjectCreates, { transaction });
      }
    }

    // Replace exams
    if (exams) {
      await StudentExam.destroy({ where: { student_id: student.userId }, transaction });
      if (exams.length) {
        const examCreates = exams.map((eid) => ({ student_id: student.userId, exam_id: eid }));
        await StudentExam.bulkCreate(examCreates, { transaction });
      }
    }

    await transaction.commit();

    const updated = await Student.findOne({
      where: { userId: authenticatedId },
      include: [
        { model: User, as: "user" },
        { model: Subject, as: "subjects" },
        { model: Exam, as: "exams" },
      ],
    });

    return res.status(200).json({ data: updated });
  } catch (err) {
    await transaction.rollback();
    return next(err instanceof ApiError ? err : new ApiError(err.message, 500));
  }
};

exports.deleteStudent = async (req, res, next) => {
  const requestedId = req.params.id;
  const authenticatedId = req.user.id;

  if (requestedId !== authenticatedId && req.user.role !== "admin") {
    return next(new ApiError("Access denied - cannot delete another student's profile", 403));
  }

  const transaction = await sequelize.transaction();

  try {
    const student = await Student.findOne({ where: { userId: authenticatedId }, transaction });
    if (!student) {
      await transaction.rollback();
      return next(new ApiError("Student profile not found", 404));
    }

    // Soft delete the student profile (paranoid true)
    await student.destroy({ transaction });

    // Cascade delete associations (paranoid true will soft delete them)
    await StudentSubject.destroy({ where: { student_id: student.userId }, transaction });
    await StudentExam.destroy({ where: { student_id: student.userId }, transaction });

    await transaction.commit();

    return res.status(200).json({ data: { message: "Student profile deleted" } });
  } catch (err) {
    await transaction.rollback();
    return next(err instanceof ApiError ? err : new ApiError(err.message, 500));
  }
};