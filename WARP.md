# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**EduPeerHub** is a Node.js/Express tutoring platform backend that connects Nigerian secondary school students with vetted university tutors for WAEC, NECO, and JAMB exam preparation. The codebase follows feature-based architecture with shared utilities.

## Development Commands

### Setup Commands
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Database setup (Sequelize)
npx sequelize-cli db:create
npm run migrate
npm run seed
```

### Development Workflow
```bash
# Start development server with hot reload
npm run dev

# Production start
npm run start

# Run all tests
npm test

# Run linting
npm run lint
npm run lint:fix

# Format code
npm run format

# Database operations
npm run migrate
npm run seed
npx sequelize-cli db:migrate:undo
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:seed:undo:all
```

### Testing Individual Features
```bash
# Run specific test files
npm test -- --testPathPattern=auth
npm test -- --testPathPattern=student
npm test -- --testPathPattern=tutor

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## Architecture Overview

### Folder Structure
The codebase follows a **feature-based architecture** with separation of concerns:

```
src/
├── features/                    # Feature modules (business logic)
│   ├── auth/                   # Authentication & authorization
│   ├── user/                   # Base user management
│   ├── student/                # Student profiles & functionality
│   ├── tutor/                  # Tutor profiles & functionality
│   ├── admin/                  # Admin operations
│   ├── subject/                # Academic subjects
│   ├── exams/                  # Exam types (WAEC, NECO, JAMB)
│   └── events/                 # Event logging
├── shared/                     # Cross-cutting concerns
│   ├── config/                 # Database, rate limiting, Stream Chat
│   ├── database/               # Sequelize models, migrations, seeders
│   ├── middlewares/            # Global middleware (auth, validation, errors)
│   ├── utils/                  # Utilities (ApiError, sendResponse, logger)
│   └── email/                  # Email services & templates
├── app.js                      # Express app configuration
└── server.js                  # Server startup & database connection
```

### Feature Module Pattern
Each feature follows a consistent structure:
```
features/[feature]/
├── [feature].controller.js     # HTTP request handlers
├── [feature].service.js        # Business logic layer
├── [feature].model.js          # Sequelize database model
├── [feature].route.js          # Express route definitions
├── [feature].validator.js      # Joi validation schemas
├── [feature].middleware.js     # Feature-specific middleware
└── [feature].spec.js          # Jest test files
```

### Database Architecture (Sequelize + PostgreSQL)

**Core Models & Relationships:**
- **User**: Base user model with authentication (UUID primary key)
- **Student**: Profile extending User (one-to-one)
- **Tutor**: Profile extending User (one-to-one) 
- **Admin**: Profile extending User (one-to-one)
- **Subject**: Academic subjects (many-to-many with Student/Tutor)
- **Exam**: Exam types like WAEC, NECO (many-to-many with Student)
- **EventLog**: System event tracking

**Key Relationships:**
- User → Student/Tutor/Admin (one-to-one via `userId`)
- Student ↔ Subject (many-to-many via `student_subjects`)
- Tutor ↔ Subject (many-to-many via `tutor_subjects`)
- Student ↔ Exam (many-to-many via `student_exams`)

### Module Aliases
The project uses module aliases for clean imports:
- `@src` → `./src`
- `@models` → `./src/shared/database/models`
- `@utils` → `src/shared/utils`
- `@features` → `./src/features`

### API Response Format
All API responses follow a consistent structure using the `sendResponse` utility:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": [validation_details] // For validation errors
}
```

### Authentication Flow
- JWT-based authentication with secure cookies
- Email verification system with Mailtrap
- Password reset functionality
- Role-based access control (admin, tutor, student)
- User account status management (active/suspended)

### External Service Integrations
- **Stream Chat**: Real-time messaging between tutors and students
- **Mailtrap**: Email notifications and verification
- **AWS CloudWatch**: Production logging (optional)

## Development Guidelines

### Code Conventions
- **File Naming**: Use dot notation (e.g., `auth.controller.js`) or camelCase for compound names
- **Folder Naming**: Use kebab-case (e.g., `user-profile/`)
- **Quotes**: Always use double quotes
- **Semicolons**: Always include semicolons
- **Error Handling**: Use `ApiError` class with `next(error)` pattern
- **Validation**: Use Joi with custom validation middleware

### Branch Strategy
- Default branch: `development`
- Branch naming: `type/short-description` (e.g., `feature/user-login`, `bugfix/navbar-overlap`)
- Use conventional commits: `feat:`, `fix:`, `chore:`, etc.
- Squash and merge PRs with format: `PR: [Description]`

### Testing Strategy
- Tests located in `src/shared/tests/`
- Named as `[feature].[component].test.js`
- Use Jest with Supertest for API testing
- Global setup/teardown for database connections
- Single worker mode to prevent database conflicts

### Environment Configuration
Key environment variables in `.env`:
- `PORT`: Server port (default: 3000)
- `DB_*`: PostgreSQL connection details
- `JWT_SECRET`: Authentication secret
- `CLIENT_URL`: Frontend URL for CORS
- `STREAM_API_KEY/SECRET`: Stream Chat credentials
- `MAILTRAP_TOKEN`: Email service token
- `NODE_ENV`: Environment mode (development/production)

### Common Development Tasks

**Adding a New Feature:**
1. Create feature directory in `src/features/[feature-name]/`
2. Implement the standard pattern (controller, service, model, route, validator)
3. Add model to `src/shared/database/models.js`
4. Add route to `src/app.js`
5. Write tests in `src/shared/tests/`

**Database Changes:**
1. Generate migration: `npx sequelize-cli migration:generate --name [description]`
2. Edit migration file in `src/shared/database/migrations/`
3. Run migration: `npm run migrate`
4. Update model associations if needed

**API Endpoint Pattern:**
- Use `sendResponse(res, statusCode, message, data)` for success
- Use `throw new ApiError(message, statusCode, details)` for errors
- Always validate input with Joi middleware
- Apply authentication middleware for protected routes