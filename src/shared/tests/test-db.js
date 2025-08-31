const fs = require("fs");
const path = require("path");
const logger = require("@utils/logger");

const NODE_ENV = "test";

const envFilePath = path.resolve(process.cwd(), "./src/", `.env.${NODE_ENV}`);

if (fs.existsSync(envFilePath)) {
  require("dotenv").config({ path: envFilePath });
  logger.info(`Loaded env: ${envFilePath}`);
} else {
  throw ".env.test file not found. Please create it based on .env.example";
}

const sequelize = require("@src/shared/database/index");

async function connectToDB() {
  // if (mongoose.connection.readyState === 1) {
  //   console.log("Already connected to MongoDB");
  //   return;
  // }
  console.log("Connecting to test database");
  try {
    await sequelize.sync({ force: true });

    console.log("Connected to test database:");
  } catch (err) {
    console.error("Database connection error:", err.message);
    throw err;
  }
}

async function disconnectFromDB() {
  console.log("Disconnecting from test database");
  try {
    gracefulExit("DISCONNECT");
  } catch (err) {
    console.error("Database disconnection error:", err);
    throw err;
  }
}

async function cleanupDB() {
  // await sequelize.drop();
  console.log("Cleaning up test database");
  await sequelize.sync({ force: true });
}

// const setupTestDb = async () => {
//   try {
//     await sequelize.sync({ force: true });
//     logger.info("✅ Database synced (development only)");
//   } catch (err) {
//     logger.error("Failed to connect to DB and start server:", err);
//     throw err;
//   }
// };

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

module.exports = {
  connectToDB,
  disconnectFromDB,
  cleanupDB,
};
