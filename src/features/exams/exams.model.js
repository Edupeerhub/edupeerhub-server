const sequelize = require("../../shared/database/index");
const DataTypes = require("sequelize");


module.exports = () => {
  const Exam = sequelize.define(
    "Exam",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        field: "isActive"
      }
    },
    {
      tableName: "exams",
      underscored: true,
      timestamps: true,
      paranoid: true,
    }
  );

  Exam.associate = (models) => {
    Exam.belongsToMany(models.Student, {
      through: models.StudentExam,
      foreignKey: "exam_id",
      otherKey: "student_id",
      as: "students"
    });
  };

  return Exam;
};