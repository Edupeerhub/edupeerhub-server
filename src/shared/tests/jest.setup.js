require("module-alias/register");

const { connectToDB } = require("./test-db");

module.exports = async function (globalConfig, projectConfig) {
  await connectToDB();
};
