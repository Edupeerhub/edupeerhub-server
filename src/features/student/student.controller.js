const {
  getStudentById,
  createStudent,
  updateStudent,
  completeStudentOnboarding
} = require('./student.service');
const sendResponse = require('../../shared/utils/sendResponse');
const ApiError = require('../../shared/utils/apiError');

/**
 * Get student by ID
 */
const getStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await getStudentById(id);
    
    if (!student) {
      throw new ApiError(404, 'Student profile not found');
    }
    
    // Check if user is authorized to view this student profile
    // Students can view their own profile, admins can view any profile
    if (req.user.role !== 'admin' && student.userId !== req.user.id) {
      throw new ApiError(403, 'Access denied - You can only view your own profile');
    }
    
    sendResponse(res, {
      statusCode: 200,
      data: student,
      message: 'Student profile retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create student profile
 */
const createStudentProfile = async (req, res, next) => {
  try {
    const { userId, learningGoals, subjectIds, examIds } = req.body;
    
    // Only admins can create student profiles for other users
    // Students can only create their own profile
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      throw new ApiError(403, 'Access denied - You can only create a profile for yourself');
    }
    
    // Verify the user exists and is a student
    const user = await req.models.User.findByPk(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    if (user.role !== 'student') {
      throw new ApiError(400, 'User must have student role to create student profile');
    }
    
    // Check if student profile already exists
    const existingStudent = await req.models.Student.findOne({
      where: { userId }
    });
    
    if (existingStudent) {
      throw new ApiError(400, 'Student profile already exists for this user');
    }
    
    const student = await createStudent({
      userId,
      learningGoals,
      subjectIds,
      examIds
    });
    
    sendResponse(res, {
      statusCode: 201,
      data: student,
      message: 'Student profile created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update student profile
 */
const updateStudentProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { learningGoals, subjectIds, examIds } = req.body;
    
    const student = await updateStudent(id, {
      learningGoals,
      subjectIds,
      examIds
    });
    
    if (!student) {
      throw new ApiError(404, 'Student profile not found');
    }
    
    // Check if user is authorized to update this student profile
    // Students can update their own profile, admins can update any profile
    if (req.user.role !== 'admin' && student.userId !== req.user.id) {
      throw new ApiError(403, 'Access denied - You can only update your own profile');
    }
    
    sendResponse(res, {
      statusCode: 200,
      data: student,
      message: 'Student profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete onboarding
 */
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
      data: student,
      message: 'Student onboarding completed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudent,
  createStudentProfile,
  updateStudentProfile,
  completeOnboarding
};