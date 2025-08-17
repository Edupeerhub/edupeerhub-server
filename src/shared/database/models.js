// =====================
// MANUAL MODEL IMPORTS
// =====================

exports.User = require("../../features/user/user.model")();
exports.Student = require("../../features/student/student.model")();
exports.Tutor = require("../../features/tutor/tutor.model")();
exports.Admin = require("../../features/admin/admin.model")();
exports.EventLog = require("../../features/events/events.model")();

// // Store models in db object
// const db = {
//   sequelize,
//   Sequelize,
//   User,
//   Student,
//   Tutor,
//   Admin,
//   EventLog,
// };

// Object.keys(db).forEach((modelName) => {
//   if (db[modelName]?.associate) {
//     db[modelName].associate(db);
//   }
// });

// module.exports = db;
// OPTIONAL: AUTO-LOADER WITH GLOB (SHORTER)

// const glob = require("glob");
// const modelFiles = glob.sync(path.join(__dirname, "../../features/**/*.model.js"));

// modelFiles.forEach((file) => {
//   const model = require(file)(sequelize, DataTypes);
//   db[model.name] = model;
// });

// // Apply associations automatically
// Object.keys(db).forEach((modelName) => {
//   if (db[modelName]?.associate) {
//     db[modelName].associate(db);
//   }
// });

/* ========================================================================
   OPTIONAL: AUTO-LOADER HELPER (DISABLED FOR NOW)

   - Scans the /features folder for any file ending in `.model.js`
   - Automatically imports and initializes it
   - Automatically applies associations
   - Pros: No need to manually update this file for new models
   - Cons: Slightly more "magic" — teammates may prefer explicit imports

// Auto-load all models from /features
const modelsPath = path.join(__dirname, "../../features");

fs.readdirSync(modelsPath, { withFileTypes: true }).forEach((featureDir) => {
  if (featureDir.isDirectory()) {
    const modelFiles = fs
      .readdirSync(path.join(modelsPath, featureDir.name))
      .filter((file) => file.endsWith(".model.js"));

    modelFiles.forEach((file) => {
      const model = require(path.join(modelsPath, featureDir.name, file))(sequelize, DataTypes);
      db[model.name] = model;
    });
  }
});

// Apply associations automatically
Object.keys(db).forEach((modelName) => {
  if (db[modelName]?.associate) {
    db[modelName].associate(db);
  }
});
========================================================================= */
