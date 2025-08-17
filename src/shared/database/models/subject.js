const sequelize = require("../index");
const DataTypes = require("sequelize");

const { Tutor, Student } = require("../models");

module.exports = () => {
  const Subject = sequelize.define(
    "Subject",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      tableName: "subjects",
      underscored: true,
    }
  );

  //Tutor associations
  Tutor.hasMany(Subject, { through: "tutor_subjects" });
  Subject.hasMany(Tutor, { through: "tutor_subjects" });

  //Tutor associations
  Student.hasMany(Subject, { through: "student_subjects" });
  Subject.hasMany(Student, { through: "student_subjects" });

  return Subject;
};
