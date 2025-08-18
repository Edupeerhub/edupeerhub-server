module.exports = (sequelize, DataTypes) => {
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
      }
    },
    {
      tableName: "subjects",
      underscored: true,
      timestamps: true,
    }
  );

  Subject.associate = (models) => {
    Subject.belongsToMany(models.Student, {
      through: models.StudentSubject,
      foreignKey: "subject_id",
      otherKey: "student_id",
      as: "students"
    });
  };

  return Subject;
};