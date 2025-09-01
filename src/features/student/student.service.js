const { Student, User, Subject, Exam, } = require("../../shared/database/models");
const ApiError = require("../../shared/utils/apiError");

exports.getStudentProfile = async (userId) => {
    const student = await Student.findOne({
      where: { userId: userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ['profileImageUrl', 'createdAt', 'firstName', 'lastName']
        },
        {
          model: Subject,
          as: "subjects",
          attributes: ['name']
        },
        {
          model: Exam,
          as: "exams",
          attributes: ['name']
        },
      ],
    });

    // If no student is found, throw an error that the controller can catch.
    if (!student) {
      throw new ApiError("Student not found", 404);
    }

    // Format and return the data.
    const responseData = {
      profileImageUrl: student.user?.profileImageUrl || null,
      userId: student.userId,
      firstName: student.user?.firstName,
      lastName: student.user?.lastName,
      gradeLevel: student.gradeLevel,
      learningGoals: student.learningGoals ? JSON.parse(student.learningGoals) : [],
      subjects: student.subjects.map(sub => sub.name),
      exams: student.exams.map(ex => ex.name),
      userCreatedAt: student.user?.createdAt
    };

    // Use sendResponse to send the successful response
    return responseData

  }