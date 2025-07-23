const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/db.config.js");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

let sequelize;

if (process.env.DATABASE_URL) {
  // Use connection string (e.g., for NeonDB)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  });
} else {
  // Fallback: use individual config values
  sequelize = new Sequelize(
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
}

// Init models

// Store models in db object
const db = {
  sequelize,
  Sequelize,
};

module.exports = db;
