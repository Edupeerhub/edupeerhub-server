const sequelize = require("@src/shared/database/index");
const DataTypes = require("sequelize");

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
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      tableName: "subjects",
      underscored: true,
    }
  );

  Subject.associate = (models) => {
    //Tutor associations

    Subject.belongsToMany(models.Tutor, {
      through: "tutor_subjects",
      // uniqueKey: "subjectId",
      // otherKey: "userId",
    });

    //Student associations
    models.Student.belongsToMany(Subject, { through: "student_subjects" , as: "subjects"});
    Subject.belongsToMany(models.Student, {
      through: "student_subjects",
      as: "student",
    });
  };

  return Subject;
};
