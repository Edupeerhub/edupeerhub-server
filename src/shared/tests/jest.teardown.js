// const jest = require("jest");
const { disconnectFromDB } = require("./test-db");

module.exports = async function (globalConfig, projectConfig) {
  try {
    await disconnectFromDB();

    
  } catch (error) {
    console.error("Cleanup error:", error);
  }
};
