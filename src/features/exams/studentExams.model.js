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
            underscored: true,
            timestamps: true,
            paranoid: true,
        }
    );
    StudentExam.associate = (models) => {
        StudentExam.belongsTo(models.Student, {
            foreignKey: "studentId",
            as: "student"
        });
        StudentExam.belongsTo(models.Exam, {
            foreignKey: "examId",
            as: "exam"
        });
    };
    return StudentExam;
};