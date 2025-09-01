const { Sequelize } = require("sequelize");
require("module-alias/register");

const config = require("@src/shared/config/db.config");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

let sequelize = new Sequelize({ dialect: dbConfig.dialect });
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    dialectOptions: dbConfig.dialectOptions,
    pool: dbConfig.pool,
  });
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      dialect: dbConfig.dialect,
      logging: dbConfig.logging,
      dialectOptions: dbConfig.dialectOptions,
      pool: dbConfig.pool,
    }
  );
}

module.exports = sequelize;
