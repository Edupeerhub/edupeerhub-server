const { completeStudentOnboarding } = require('./student.service');
const sendResponse = require('../../shared/utils/sendResponse');

const completeOnboarding = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { learningGoals, subjectIds, examIds } = req.body;
    
    const student = await completeStudentOnboarding(userId, {
      learningGoals,
      subjectIds,
      examIds
    });
    
    sendResponse(res, {
      statusCode: 200,
       student,
      message: 'Student onboarding completed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  completeOnboarding
};