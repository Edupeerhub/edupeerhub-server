const sequelize = require("../../shared/database/index");
const DataTypes = require("sequelize");


module.exports = () => {
    const StudentExam = sequelize.define(
        "StudentExam",
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
            exam_id: {
                type: DataTypes.UUID,
                allowNull: false,
            }
        },
        {
            tableName: "student_exams",
            timestamps: false,
        }
    );
    StudentExam.associate = (models) => {
        StudentExam.belongsTo(models.Student, {
            foreignKey: "student_id",
            as: "student"
        });
        StudentExam.belongsTo(models.Exam, {
            foreignKey: "exam_id",
            as: "exam"
        });
    };
    return StudentExam;
};