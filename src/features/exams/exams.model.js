module.exports = (sequelize, DataTypes) => {
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
      }
    },
    {
      tableName: "exams",
      underscored: true,
      timestamps: true,
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