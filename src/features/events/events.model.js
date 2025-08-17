const sequelize = require("../../shared/database/index");
const DataTypes = require("sequelize");
module.exports = () => {
  const EventLog = sequelize.define(
    "EventLog",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      eventType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      details: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      tableName: "event_logs",
      underscored: true,
      timestamps: true,
      updatedAt: false,
    }
  );
  return EventLog;
};
