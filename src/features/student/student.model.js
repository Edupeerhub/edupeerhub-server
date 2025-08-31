const sequelize = require("@src/shared/database/index");
const { DataTypes } = require("sequelize");

module.exports = () => {
  const Student = sequelize.define(
    "Student",
    {
      userId: {
        type: DataTypes.UUID,
        primaryKey: true,
        field: "user_id",
      },
      gradeLevel: {
        type: DataTypes.STRING,
        allowNull: true,
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
    Student.belongsTo(models.User, { foreignKey: "userId", as: "user" });

    Student.belongsToMany(models.Exam, {through: "student_exams", foreignKey: "studentId"});
  };

  return Student;
};
