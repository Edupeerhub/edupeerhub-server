const { User, Tutor, Student, Subject } = require("@models");

const user = {
  firstName: "John",
  lastName: "Dupe",
  email: "john@example.com",
  password: "StrongPass123!",
};
exports.tutorObject = {
  firstName: "Tutor",
  lastName: "Dupe",
  email: "tutor@example.com",
  password: "StrongPass123!",
};

exports.studentObject = {
  firstName: "Student",
  lastName: "Dupe",
  email: "student@example.com",
  password: "StrongPass123!",
};

const { v4: uuidv4 } = require("uuid");

exports.uuid = uuidv4;

exports.userObject = user;

exports.createUser = async ({ verified = true, isOnboarded = true }) =>
  await User.create({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    passwordHash: user.password,
    profileImageUrl: "randomAvatar",
    verificationToken: "123456",
    verificationTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    isVerified: verified,
    isOnboarded: isOnboarded,
  });

// Helper to create a Tutor (with user and subject association)
exports.createTutor = async ({
  bio = "Test tutor bio",
  email = this.tutorObject.email,
  education = "BSc Test Education",
  timezone = "UTC",
  rating = 0,
  approvalStatus = "approved",
  profileVisibility = "active",
  subjectIds = [],
  isVerified = true,
  isOnboarded = true,
} = {}) => {
  const createdUser = await User.create({
    email: email,
    firstName: this.tutorObject.firstName,
    lastName: this.tutorObject.lastName,
    passwordHash: this.tutorObject.password,
    role: "tutor",
    profileImageUrl: "randomAvatar",
    isVerified,
    isOnboarded,
  });
  const tutor = await Tutor.create({
    userId: createdUser.id,
    bio,
    education,
    timezone,
    rating,
    approvalStatus,
    profileVisibility,
  });
  if (subjectIds.length) {
    const subjects = await Subject.findAll({ where: { id: subjectIds } });
    await tutor.setSubjects(subjects);
  }
  return { user: createdUser, tutor };
};

// Helper to create a Student (with user and subject association)
exports.createStudent = async ({
  gradeLevel = "Grade 1",
  learningGoals = ["Goal 1"],
  subjectIds = [],
  isVerified = true,
  isOnboarded = true,
  email = this.studentObject.email,
} = {}) => {
  const createdUser = await User.create({
    email: email,
    firstName: this.studentObject.firstName,
    lastName: this.studentObject.lastName,
    passwordHash: this.studentObject.password,
    role: "student",
    profileImageUrl: "randomAvatar",
    isVerified,
    isOnboarded,
  });
  const student = await Student.create({
    userId: createdUser.id,
    gradeLevel,
    learningGoals,
  });
  if (subjectIds.length) {
    const subjects = await Subject.findAll({ where: { id: subjectIds } });
    await student.setSubjects(subjects);
  }
  return { user: createdUser, student };
};
