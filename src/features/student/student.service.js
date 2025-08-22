const { User, Student, Subject, Exam, StudentSubject, StudentExam } = 
  require('../../shared/database/models');
const sequelize = require('../../shared/database');
const ApiError = require('../../shared/utils/apiError');

/**
 * Get student by ID
 */
const getStudentById = async (studentId) => {
  return await Student.findByPk(studentId, {
    include: [
      { 
        model: User, 
        as: 'user',
        attributes: { exclude: ['passwordHash', 'verificationToken', 'resetPasswordToken'] }
      },
      { model: Subject, as: 'subjects' },
      { model: Exam, as: 'exams' }
    ]
  });
};

/**
 * Create student profile
 */
const createStudent = async ({ userId, learningGoals, subjectIds = [], examIds = [] }) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Create student profile
    const student = await Student.create(
      { 
        userId,
        learningGoals 
      },
      { transaction }
    );
    
    // Add subjects if provided
    if (subjectIds.length > 0) {
      const subjectRecords = subjectIds.map(subjectId => ({
        studentId: student.id,
        subjectId
      }));
      await StudentSubject.bulkCreate(subjectRecords, { transaction });
    }
    
    // Add exams if provided
    if (examIds.length > 0) {
      const examRecords = examIds.map(examId => ({
        studentId: student.id,
        examId
      }));
      await StudentExam.bulkCreate(examRecords, { transaction });
    }
    
    await transaction.commit();
    
    // Return the complete student profile
    return await getStudentById(student.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Update student profile
 */
const updateStudent = async (studentId, { learningGoals, subjectIds = [], examIds = [] }) => {
  const transaction = await sequelize.transaction();
  
  try {
    const student = await Student.findByPk(studentId, { transaction });
    
    if (!student) {
      throw new ApiError(404, 'Student profile not found');
    }
    
    // Update learning goals if provided
    if (learningGoals !== undefined) {
      await student.update({ learningGoals }, { transaction });
    }
    
    // Update subjects
    await StudentSubject.destroy({
      where: { studentId },
      transaction
    });
    
    if (subjectIds.length > 0) {
      const subjectRecords = subjectIds.map(subjectId => ({
        studentId,
        subjectId
      }));
      await StudentSubject.bulkCreate(subjectRecords, { transaction });
    }
    
    // Update exams
    await StudentExam.destroy({
      where: { studentId },
      transaction
    });
    
    if (examIds.length > 0) {
      const examRecords = examIds.map(examId => ({
        studentId,
        examId
      }));
      await StudentExam.bulkCreate(examRecords, { transaction });
    }
    
    await transaction.commit();
    
    // Return the updated student profile
    return await getStudentById(studentId);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Complete student onboarding (you already have this)
 */
const completeStudentOnboarding = async (userId, onboardingData) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Find the user and ensure they're a student
    const user = await User.findByPk(userId, {
      include: [{
        model: Student,
        as: 'student'
      }],
      transaction
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    if (user.role !== 'student') {
      throw new ApiError(400, 'Only students can complete onboarding');
    }
    
    if (!user.student) {
      throw new ApiError(400, 'Student profile not found');
    }
    
    // Check if onboarding is already completed
    if (user.isOnboarded) {
      throw new ApiError(400, 'Onboarding already completed');
    }
    
    const { learningGoals, subjectIds, examIds } = onboardingData;
    
    // Update student profile with learning goals
    await user.student.update({
      learningGoals: learningGoals
    }, { transaction });
    
    // Add subjects (replace existing)
    await StudentSubject.destroy({
      where: { 
        studentId: user.student.id 
      },
      transaction
    });
    
    const subjectRecords = subjectIds.map(subjectId => ({
      studentId: user.student.id,
      subjectId: subjectId
    }));
    
    await StudentSubject.bulkCreate(subjectRecords, { transaction });
    
    // Add exams (replace existing)
    await StudentExam.destroy({
      where: { 
        studentId: user.student.id 
      },
      transaction
    });
    
    const examRecords = examIds.map(examId => ({
      studentId: user.student.id,
      examId: examId
    }));
    
    await StudentExam.bulkCreate(examRecords, { transaction });
    
    // Mark user as onboarded
    await user.update({
      isOnboarded: true
    }, { transaction });
    
    await transaction.commit();
    
    // Return updated user with all associations
    return await User.findByPk(userId, {
      include: [
        { 
          model: Student, 
          as: 'student',
          include: [
            { model: Subject, as: 'subjects' },
            { model: Exam, as: 'exams' }
          ]
        }
      ],
      attributes: { exclude: ['passwordHash', 'verificationToken', 'resetPasswordToken'] }
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  getStudentById,
  createStudent,
  updateStudent,
  completeStudentOnboarding
};