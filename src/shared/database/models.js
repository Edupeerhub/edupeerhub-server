const sequelize = require("./index");

// =====================
// MANUAL MODEL IMPORTS
// =====================
const definers = [
  require("@features/user/user.model"),
  require("@features/student/student.model"),
  require("@features/subject/subject.model"),
  require("@features/tutor/tutor.model"),
  require("@features/admin/admin.model"),
  require("@features/exams/exams.model"),
  require("@features/events/events.model"),
  require("@features/booking/booking.model"),
];

///Add models
for (const definer of definers) {
  definer(sequelize);
}

//Associate models
for (const model of sequelize.modelManager.models) {
  model?.associate?.call(model, sequelize.models);
}

// sequelize.models.Exam.bulkCreate([
//   { name: "NECO", description: "", is_active: true },
//   { name: "WAEC", description: "", is_active: true },
// ]);

// sequelize.models.Subject.bulkCreate([
//   { name: "English", description: "English language", is_active: true },
//   { name: "Mathematics", description: "Mathematics", is_active: true },
//   { name: "Physics", description: "Physics", is_active: true },
//   { name: "Chemistry", description: "Chemistry", is_active: true },
// ]);

module.exports = {
  User: sequelize.models.User,
  Student: sequelize.models.Student,
  Tutor: sequelize.models.Tutor,
  Subject: sequelize.models.Subject,
  Admin: sequelize.models.Admin,
  EventLog: sequelize.models.EventLog,
  Exam: sequelize.models.Exam,
  Booking: sequelize.models.Booking,
  // StudentExam: sequelize.models.StudentExam,
};

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
