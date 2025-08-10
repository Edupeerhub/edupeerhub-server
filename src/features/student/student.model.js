const sequelize = require("../../shared/database/index");
const DataTypes = require("sequelize");

module.exports = () => {
  const Student = sequelize.define(
    "Student",
    {
      userId: {
        type: DataTypes.UUID,
        primaryKey: true,
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
    }
  );

  Student.associate = (models) => {
    Student.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  };

  return Student;
};
