const fs = require("fs");
const path = require("path");
const logger = require("@utils/logger");

const NODE_ENV = "test";
const envFilePath = path.resolve("./src", `.env.${NODE_ENV}`);
if (fs.existsSync(envFilePath)) {
  require("dotenv").config({ path: envFilePath });
  logger.info(`Loaded env: ${envFilePath}`);
} else {
  throw ".env.test file not found. Please create it based on .env.example";
}

;
const sequelize = require("@src/shared/database/index");

const setupTestDb = async () => {
  try {
    
    await sequelize.sync({ force: true });
    logger.info("✅ Database synced (development only)");
    // }
  } catch (err) {
    logger.error("Failed to connect to DB and start server:", err);
    throw err;
  }
};

const gracefulExit = async (signal) => {
  logger.info(`${signal} received, shutting down gracefully...`);
  try {
    await sequelize.close();
    logger.info("Database connection closed");
  } catch (error) {
    logger.error("Error during shutdown:", error);
  }
};

process.on("SIGTERM", () => gracefulExit("SIGTERM"));
process.on("SIGINT", () => gracefulExit("SIGINT"));

module.exports = setupTestDb;
