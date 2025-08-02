# Sequelize CLI Cheatsheet

---

### Setup

```bash
# Install Sequelize CLI locally
npm install --save-dev sequelize-cli

# Install Sequelize & the DB driver (Postgres example)
npm install sequelize pg pg-hstore
```

---

### Initialization

```bash
# Create config, models, migrations, and seeders folders
npx sequelize-cli init
```

This command creates the following essential folders and a configuration file:

- `config/config.json`
- `models/`
- `migrations/`
- `seeders/`

---

### Migrations

```bash
# Generate a new migration file (recommended for models with attributes)
npx sequelize-cli migration:generate --name create-users

# Create a blank migration file (alternative, for custom migrations)
npx sequelize-cli migration:create --name create-users

# Run all pending migrations
npx sequelize-cli db:migrate

# Undo the last migration that was run
npx sequelize-cli db:migrate:undo

# Undo all migrations (resets your database schema)
npx sequelize-cli db:migrate:undo:all
```

---

### Seeders

```bash
# Generate a new seeder file
npx sequelize-cli seed:generate --name seed-users

# Run all seeders
npx sequelize-cli db:seed:all

# Run a specific seeder file by its timestamped name
npx sequelize-cli db:seed --seed 20250801120000-seed-users.js

# Undo the last seeder that was run
npx sequelize-cli db:seed:undo

# Undo all seeders (resets your seeded data)
npx sequelize-cli db:seed:undo:all
```

---

### Models

```bash
# Generate a model with specified attributes (creates both model and migration)
npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string
```

This command automatically creates:

- A model file in `models/`
- A migration file in `migrations/`

---

### Database Commands

```bash
# Create database (uses connection details from config/config.json or config.js)
npx sequelize-cli db:create

# Drop database
npx sequelize-cli db:drop
```

---

### Tips

- Always use the `--name` flag for descriptive migration and seeder filenames.
- **Migrations** define your database's **structure** (tables, columns, indexes).
- **Models** define your application's **code structure** for interacting with the database.
- Use `underscored: true` in your model definitions to automatically map `camelCase` model attributes to `snake_case` database column names.
- Always **commit** your migration and seeder files to version control so team members and deployment environments have them.
