const sequelize = require("../../shared/database/index");
const DataTypes = require("sequelize");

module.exports = () => {
  const Admin = sequelize.define(
    "Admin",
    {
      userId: {
        type: DataTypes.UUID,
        primaryKey: true,
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
    Admin.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  };

  return Admin;
};
