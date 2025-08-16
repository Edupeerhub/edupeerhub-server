const sequelize = require("../../shared/database/index");
const { DataTypes } = require("sequelize");

module.exports = () => {
  const Admin = sequelize.define(
    "Admin",
    {
      userId: {
        type: DataTypes.UUID,
        primaryKey: true,
        field: "user_id",
      },
      isSuperAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "admin_profiles",
      underscored: true,
    }
  );

  Admin.associate = (models) => {
    Admin.belongsTo(models.User, { foreignKey: "userId", as: "user" });
  };

  return Admin;
};
