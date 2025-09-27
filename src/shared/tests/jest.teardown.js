const { disconnectFromDB } = require("./test-db");

module.exports = async function (globalConfig, projectConfig) {
  try {
    await disconnectFromDB();
    console.log("Jest teardown completed");
  } catch (error) {
    console.error("Cleanup error:", error);
  }
};
