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
            }
        },
        {
            tableName: "student_subjects",
            timestamps: false,
        }
    );
    StudentSubject.associate = (models) => {
        StudentSubject.belongsTo(models.Student, {
            foreignKey: "student_id",
            as: "student"
        });
        StudentSubject.belongsTo(models.Subject, {
            foreignKey: "subject_id",
            as: "subject"
        })
    }
    return StudentSubject;
};