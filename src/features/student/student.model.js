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
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
      },
    },
    {
      tableName: "student_profiles",
      underscored: true,
      defaultScope: {
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
    }
  );

  Student.associate = (models) => {
    Student.belongsTo(models.User, { foreignKey: "userId", as: "user" });

    Student.addScope("join", {
      include: [
        {
          model: models.User.scope("join"),
          as: "user",
        },

        {
          model: models.Subject.scope("join"),
          as: "subjects",
          through: { attributes: [] },
        },
        {
          model: models.Exam,
          as: "exams",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    Student.belongsToMany(models.Exam, {
      through: "student_exams",
      // foreignKey: "studentId",
      as: "exams",
    });
  };

  return Student;
};
