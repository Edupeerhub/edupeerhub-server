# PR: [Short, clear title of the feature or fix]

\<\!-- Example: PR: Implement user authentication flow --\>

---

## Description

\<\!-- Provide a summary of the change and what it does --\>

This PR adds the backend login controller and passport strategy.
Also integrates the frontend login form using Axios and handles error messaging from the standardized backend response format.

---

## Related Issues

\<\!-- Link related issues using GitHub syntax --\>

Closes #42
Relates to #41

---

## Checklist

**General:**

- [ ] Code is clean and linted (`npm run lint`).
- [ ] All automated tests pass (`npm run test`).
- [ ] Feature was tested manually and works as expected.
- [ ] No `console.log` statements (frontend) or debug logging (backend) remain.
- [ ] Documentation (inline comments, README, etc.) is updated if necessary.

**Backend Specific:**

- [ ] API endpoints are correctly defined and accessible.
- [ ] All necessary validation (input, business logic) is implemented.
- [ ] Database interactions are efficient and correctly handle data.
- [ ] Error handling and logging are robust and informative.
- [ ] Security considerations (e.g., authentication, authorization, input sanitization) are addressed.
- [ ] New/updated API endpoints are covered by integration tests.

---

## API Response Example (optional for BE)

```json
{
  "success": true,
  "message": "User created successfully.",
  "data": {
    "id": "abc123",
    "name": "Jane Doe"
  }
}
```

## Notes for Reviewers

\<\!-- Call out anything specific you'd like reviewers to look at --\>

Passport error is handled via `next(ApiError)`.

Axios interceptor rejects if `success: false`, so try invalid email to see FE error handling.
