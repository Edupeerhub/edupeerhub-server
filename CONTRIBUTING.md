# Project Conventions – CONTRIBUTING.md

This document outlines our agreed project conventions and development guidelines. Please follow these to ensure consistency and maintainability across the team.

---

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone <repo-url>
   cd repo-name
   ```

2. **Install dependencies:** `npm install`

3. **Start the dev server:** `npm run dev`

---

## Making a Contribution

1. **Create a branch:** `git checkout -b feature/your-feature`
2. **Write clean, clear commits:** `git commit -m "feat: add login functionality"`
3. **Push your branch:** `git push origin feature/your-feature`
4. **Open a pull request on GitHub**

---

## Branch Naming Convention

- Default branch is development
- Use feature/, bugfix/, hotfix/, and chore/ prefixes
- Name branches using kebab-case
- Branch names must be descriptive and scoped to the work being done

Please follow this format: `type/short-description`

**Examples:**

- `feature/user-login`
- `bugfix/navbar-overlap`
- `hotfix/payment-issue`
- `docs/update-readme`

---

## Linting & Commit Style

- Prettier handles formatting (auto-run on save)
- ESLint enforces syntax and best practices
- Use `npm run lint` and `npm run format` before pushing
- Follow Conventional Commits (preferred)
- Commit messages must be descriptive

**Examples:**

```
feat(auth): add JWT login support
fix(user): resolve email duplication bug
chore(deps): upgrade joi to v17
```

---

## Pull Request Guidelines

- Pull requests must target the **`development`** branch.
- **One task per branch and pull request.**
- **Link related issue:** `Closes #issue-number`
- Use **meaningful commit messages.**
- Use the **PR template** (if provided).
- **Pass all tests and linter checks** before requesting a review.
- **Ask for review.**
- **Do not merge your own PR.**

### PR Title Examples

- PR: Add login middleware to auth module
- PR: Fix bug with user ID validation
- PR: Refactor email service logic

---

### Squash Commit Message Format

When squashing and merging a pull request, format the commit message like this:

`PR: Implement user authentication flow`

This keeps the Git history clean, readable, and directly tied to the purpose of the PR.

---

## Code Quality

Before opening your PR, make sure:

```bash
npm run lint
npm run test
```

---

## Review & Merge Process

1. Wait for at least one team member approval
2. CI must pass
3. Use **Squash and merge** to keep clean history
4. Delete your branch after merge

---

## After Merge

Delete your branch:

```bash
git push origin --delete feature/your-feature
```

Pull latest development to stay up to date:

```bash
git checkout development
git pull origin development
```

---

## 1. Folder Naming – kebab-case

Use lowercase letters and hyphens (`-`) for all folder names.

**Example:**

```
user-profile/
email-service/
```

---

## 2. File Naming – dot or camelCase (compound)

- Use dot notation for regular files within features.
- Use camelCase only for compound file names (e.g., `errorHandler.js`, `courseRegistration.controller.js`).

**Examples:**

```
auth.controller.js
db.config.js
courseRegistration.controller.js    // compound name
errorHandler.js                     // compound name
```

---

## 3. Quotes – Double Quotes Only

Use double quotes consistently in all JavaScript and JSON files.

**Correct:**

```js
const name = "Jane";
```

---

## 4. Semicolons – Always Use

Always end statements with a semicolon.

**Correct:**

```js
const user = { name: "Jane" };
```

---

## 5. Folder Structure – Feature-Based + Shared Modules

```
src/
├── feature/
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.routes.js
│   │   └── auth.service.js
│   ├── user-profile/
│   │   ├── user.controller.js
│   │   ├── user.routes.js
│   │   └── user.model.js
│
├── shared/
│   ├── config/
│   │   └── db.config.js
│   ├── tests/
│   │   ├── auth.controller.test.js
│   │   └── user.controller.test.js
```

---

## 6. Test File Placement – Shared `tests/` Folder

All test files are placed under `src/shared/tests/`, named according to the file they test.

**Example:**

```
shared/tests/
├── auth.controller.test.js
├── user.controller.test.js
```

---

## 7. API Response Format

### Success – Single Object

```json
{
  "success": true,
  "message": "User created successfully.",
  "data": {
    "id": "123",
    "name": "Jane"
  }
}
```

### Success – Array

```json
{
  "success": true,
  "message": "Users fetched successfully.",
  "data": [
    {
      "id": "123",
      "name": "Jane"
    },
    {
      "id": "124",
      "name": "John"
    }
  ]
}
```

### Error – Custom `ApiError` + Joi

```json
{
  "success": false,
  "message": "Validation error.",
  "error": [
    {
      "field": "email",
      "issue": "email must be a valid email",
      "value": "not-an-email"
    },
    {
      "field": "password",
      "issue": "password is required"
    }
  ]
}
```

---

## Development Guide

### 8\. `ApiError` Class

```js
// shared/utils/apiError.js
class ApiError extends Error {
  constructor(message, statusCode = 500, errorDetails = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = errorDetails;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
```

### 9\. `sendResponse` Utility

```js
// shared/utils/sendResponse.js

/**
 * Use this to standardize success responses across all controllers.
 * Example:
 * sendResponse(res, 201, "User created successfully", createdUser);
 */

const sendResponse = (
  res,
  statusCode = 200,
  message = "Success",
  data = null
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export default sendResponse;
```

### 10\. Joi Validation Middleware

```js
// shared/middlewares/validate.js
import Joi from "joi";
import ApiError from "../utils/apiError.js";

const validate =
  (schema, property = "body") =>
  (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.context.label,
        message: d.message,
      }));

      return next(new ApiError("Validation error.", 400, details));
    }

    next();
  };

export default validate;

// Example usage:
// router.post("/user", validate(userSchema)); // default: req.body
// router.get("/search", validate(searchSchema, "query")); // validate query params
```

### 11\. Error Middleware

```js
// shared/middlewares/error.middleware.js
import ApiError from "../utils/apiError.js";

const errorHandler = (error, req, res, next) => {
  console.error("Error:", {
    message: error.message,
    status: error.statusCode || 500,
    details: error.details,
    stack: error.stack,
    path: req.originalUrl,
  });

  // Mongoose Errors
  if (error.name === "CastError") {
    error = new ApiError("Invalid ID format", 400);
  }

  // Sequelize validation errors (e.g., notNull, len, isEmail, etc.)
  if (error instanceof ValidationError) {
    const messages = error.errors.map((err) => err.message);
    error = new ApiError("Validation error", 400, messages);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    error: error.details ?? null,
  });
};

export default errorHandler;
```

### 12\. Controller Usage Example – User Resource

```js
// feature/user-profile/user.controller.js
import User from "./user.model.js";
import ApiError from "../../shared/utils/apiError.js";
import sendResponse from "../../shared/utils/sendResponse.js";

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      throw new ApiError(
        "User not found",
        404,
        `No user exists with ID: ${id}`
      );
    }

    sendResponse(res, 200, "User retrieved successfully", user);
  } catch (error) {
    next(error);
  }
};

// Example for 201 Created
export const createUser = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    sendResponse(res, 201, "User created successfully", newUser);
  } catch (error) {
    next(error);
  }
};
```

### 13\. Callback-Based Error Handling – Passport Login

```js
// feature/auth/auth.controller.js
import passport from "passport";
import ApiError from "../../shared/utils/apiError.js";
import sendResponse from "../../shared/utils/sendResponse.js";

/**
 * @desc Login controller using Passport local strategy
 * @why Demonstrates callback-style error handling.
 * Required because Passport's `authenticate` uses callbacks,
 * not async/await, so `next(ApiError)` is used instead of `throw`.
 */
export const login = (req, res, next) => {
  passport.authenticate("login", { session: false }, (err, user, info) => {
    if (err) {
      return next(new ApiError("Authentication error", 500, err.message));
    }

    if (!user) {
      return next(new ApiError("Invalid credentials", 401, info?.message));
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        return next(new ApiError("Login failed", 500, err.message));
      }

      sendResponse(res, 200, "Logged in successfully", {
        id: user._id,
        email: user.email,
      });
    });
  })(req, res, next);
};
```

---

Please follow these standards to keep the codebase clean, collaborative, and easy to scale. Feel free to suggest improvements via Pull Request to this file.
