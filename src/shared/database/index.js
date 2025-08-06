const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/db.config");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

let sequelize;

if (process.env.DATABASE_URL) {
  // Use connection string (e.g., for NeonDB)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  });
} else {
  // Fallback: use individual config values
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      dialect: dbConfig.dialect,
      logging: dbConfig.logging,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

// =====================
// MANUAL MODEL IMPORTS
// =====================
const User = require("../../features/user/user.model")(sequelize, DataTypes);
const Student = require("../../features/student/student.model")(
  sequelize,
  DataTypes
);
const Tutor = require("../../features/tutor/tutor.model")(sequelize, DataTypes);
const Admin = require("../../features/admin/admin.model")(sequelize, DataTypes);

// Store models in db object
const db = {
  sequelize,
  Sequelize,
  User,
  Student,
  Tutor,
  Admin,
};

Object.keys(db).forEach((modelName) => {
  if (db[modelName]?.associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;

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
