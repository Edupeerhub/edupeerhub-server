const fs = require("fs");
const path = require("path");

const NODE_ENV = process.env.NODE_ENV || "development";
const envFilePath = path.resolve(__dirname, `.env.${NODE_ENV}`);
if (fs.existsSync(envFilePath)) {
  require("dotenv").config({ path: envFilePath });
  console.log(`Loaded env: ${envFilePath}`);
} else {
  require("dotenv").config();
  console.log("Loaded default .env");
}

const logger = require("./shared/utils/logger");
const app = require("./app");
const db = require("./shared/database");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    if (NODE_ENV === "production") {
      await db.sequelize.authenticate();
      logger.info("PostgreSQL connected successfully");
    }

    if (NODE_ENV === "development") {
      await db.sequelize.sync({ alter: true });
      logger.info("✅ Database synced");
    }

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
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
    await db.sequelize.close();
    logger.info("Database connection closed");
  } catch (error) {
    logger.error("Error during shutdown:", error);
  }
};

process.on("SIGTERM", () => gracefulExit("SIGTERM"));
process.on("SIGINT", () => gracefulExit("SIGINT"));

startServer();
