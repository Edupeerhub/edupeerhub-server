const sequelize = require("../../shared/database/index");
const DataTypes = require("sequelize");

module.exports = () => {
  const StudentSubject = sequelize.define(
    "StudentSubject",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "student_subjects",
      underscored: true,
      timestamps: true,
      paranoid: true,
    }
  );
  StudentSubject.associate = (models) => {
    StudentSubject.belongsTo(models.Student, {
      foreignKey: "studentId",
      as: "student",
    });
    StudentSubject.belongsTo(models.Subject, {
      foreignKey: "subjectId",
      as: "subject",
    });
  };
  return StudentSubject;
};
