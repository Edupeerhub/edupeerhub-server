const sequelize = require("../../shared/database/index");
const DataTypes = require("sequelize");

module.exports = () => {
  const Student = sequelize.define(
    "Student",
    {
      userId: {
        type: DataTypes.UUID,
        primaryKey: true,
        // references: {
        //   model: "users",
        //   key: "id",
        // },
      },
      gradeLevel: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      learningGoals: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "student_profiles",
      underscored: true,
      paranoid: true,
    }
  );

  Student.associate = (models) => {
    // one - one relationship w/user
    Student.belongsTo(models.User, {
      // targetKey: "id",
      // as: "user",
      foreignKey: "userId",
      as: "user",
  
    });

    // many to many relationship w/subject
    Student.belongsToMany(models.Subject, {
      through: models.StudentSubject,
      foreignKey: "studentId",      
      as: "subjects",
    });

    // one to many relationship w/exams
    Student.belongsToMany(models.Exam, {
      through: models.StudentExam,
      foreignKey: "studentId",      
      as: "exams",
    });
  };

  return Student;
};
