const sequelize = require("../../shared/database/index");
const DataTypes = require("sequelize");

module.exports = () => {
  const Subject = sequelize.define(
    "Subject",
    {
      id: {
        type: DataTypes.UUID,
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
        field: "is_active",
      },
    },
    {
      tableName: "subjects",
      underscored: true,
      timestamps: true,
      paranoid: true,
    }
  );

  Subject.associate = (models) => {
    Subject.belongsToMany(models.Student, {
      through: models.StudentSubject,
      foreignKey: "subjectId",
      as: "students",
    });
  };

  return Subject;
};
