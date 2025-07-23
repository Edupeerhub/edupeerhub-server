const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/db.config.js");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Init models

// Store models in db object
const db = {
  sequelize,
  Sequelize,
};

module.exports = db;
