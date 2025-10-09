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
      isActive: {
        type: DataTypes.BOOLEAN,
        field: "is_active",
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      tableName: "subjects",
      underscored: true,
      scopes: {
        defaultScope: {
          attributes: ["id", "name", "description", "isActive"],
        },
      },
    }
  );

  Subject.associate = (models) => {
    Subject.addScope("join", {
      attributes: ["id", "name", "description"],
    });

    Subject.belongsToMany(models.Tutor, {
      through: "tutor_subjects",
      as: "subjects",
      // uniqueKey: "subjectId",
      // otherKey: "userId",
    });

    models.Tutor.belongsToMany(Subject, {
      through: "tutor_subjects",
      as: "subjects",
    });
    //Student associations
    // models.Student.belongsToMany(Subject, {
    //   through: "StudentSubject",
    //   as: "subjects",

    // });
    // Subject.belongsToMany(models.Student, {
    //   through: "StudentSubject",
    //   as: "student",
    // });
  };

  return Subject;
};
