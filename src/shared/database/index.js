const { Sequelize } = require("sequelize");
const config = require("../config/db.config");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const useSSL = process.env.DB_SSL === "true";

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    dialectOptions: useSSL
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);


module.exports = sequelize;
