const fs = require("fs");
const path = require("path");
const logger = require("./shared/utils/logger");

const NODE_ENV = process.env.NODE_ENV || "development";
const envFilePath = path.resolve(__dirname, `.env.${NODE_ENV}`);
if (fs.existsSync(envFilePath)) {
  require("dotenv").config({ path: envFilePath });
  logger.info(`Loaded env: ${envFilePath}`);
} else {
  require("dotenv").config();
  logger.info("Loaded default .env");
}

const app = require("./app");
const sequelize = require("./shared/database/index");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    if (NODE_ENV === "production") {
      await sequelize.authenticate();
      logger.info("PostgreSQL connected successfully");
    }

    if (NODE_ENV === "development") {
      await sequelize.sync();
      logger.info("✅ Database synced (development only)");
    }

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
      logger.info(`API Base URL: http://localhost:${PORT}/api`);
    });
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

startServer();
