const { User, Student, Subject, Exam, StudentSubject, StudentExam } = require('../../shared/database/models');
const sequelize = require('../../shared/database');
const ApiError = require('../../shared/utils/apiError');

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
      id: sequelize.UUIDV4(),
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
      id: sequelize.UUIDV4(),
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
  completeStudentOnboarding
};