const sequelize = require("@src/shared/database/index");
const models = require("@src/shared/database/models");
const DataTypes = require("sequelize");

module.exports = () => {
  const Exam = sequelize.define(
    "Exam",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        field: "is_active",
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      tableName: "exams",
      underscored: true,
      timestamps: true,
    }
  );

  Exam.associate = (models) => {
    Exam.belongsToMany(models.Student, {
      through: "student_exams",
      // foreignKey: "id",
      as: "students",
    });
  };

  return Exam;
};
