# Edupeerhub Server

## Project Overview

**Edupeerhub** is a proprietary peer-powered ed-tech platform designed to democratize access to quality education for Nigerian secondary school students. By connecting learners with vetted university undergraduates and recent graduates, Edupeerhub enables personalized, live one-on-one tutoring sessions focused on exam preparation for WAEC, NECO, and JAMB.

This repository contains the **server-side API** powering Edupeerhub. The frontend (client) and backend (server) are maintained as separate codebases.

---

## Mission

Empower Nigerian students with affordable, accessible, and high-quality academic support by leveraging a network of peer tutors and modern web technologies.

---

## Architecture Overview

- **Separation of Concerns:**
  - **Client:** Mobile-first web application (maintained in a separate repository)
  - **Server:** RESTful API built with Node.js, Express, and PostgreSQL

- **Core Technologies:**
  - Node.js, Express, Sequelize ORM, PostgreSQL
  - JWT-based authentication
  - Integrated email notifications
  - Stream Chat for messaging

---

## Key Features

- **Student & Tutor Profiles:**  
  Rich profile management for both students and tutors

- **Live Tutoring Sessions:**  
  Schedule and join one-on-one video sessions

- **Session Scheduling:**  
  Availability management and booking system

- **Messaging & Collaboration:**  
  In-app chat and basic whiteboard tools

- **Admin Controls:**  
  Tutor vetting, user management, reporting, and moderation

- **Secure Authentication:**  
  JWT-based login, password reset, and email verification

---

## System Requirements

- **Node.js:** v18 or higher
- **PostgreSQL:** v13 or higher
- **npm:** v9 or higher
- **Operating System:** Windows, macOS, or Linux

---

## Installation & Setup

1. **Clone the Repository**

   ```sh
   git clone https://github.com/Edupeerhub/edupeerhub-server.git
   cd edupeerhub-server
   ```

2. **Install Dependencies**

   ```sh
   npm install
   ```

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env` and update values as needed:

   ```sh
   cp .env.example .env
   ```

   - Set database credentials, JWT secret, email provider settings, etc.

4. **Run Database Migrations**

   ```sh
   npm run migrate
   ```

5. **Start the Server**
   ```sh
   npm run dev
   ```

The API will be available at `http://localhost:3000/api`

---

## Usage Examples

### Health Check

```sh
curl http://localhost:3000/api/health
```

### Register a New Tutor (Authenticated)

```javascript
// Example POST request using fetch
fetch("/api/tutor", {
  method: "POST",
  headers: {
    Authorization: "Bearer <JWT>",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    bio: "I am a passionate tutor",
    education: "BSc Mathematics",
    timezone: "UTC+1",
    subjects: [1, 2, 3],
  }),
});
```

### Schedule a Tutoring Session

```javascript
// Example POST request
fetch("/api/booking", {
  method: "POST",
  headers: {
    Authorization: "Bearer <JWT>",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tutorId: "<tutor-uuid>",
    date: "2025-09-10",
    time: "15:00",
  }),
});
```

---

## Configuration Options

All configuration is managed via environment variables. See `.env.example` for details.

| Variable       | Description                | Example Value         |
| -------------- | -------------------------- | --------------------- |
| PORT           | Server port                | 3000                  |
| DB_HOST        | Database host              | localhost             |
| DB_USER        | Database username          | postgres              |
| DB_PASS        | Database password          | secret                |
| DB_NAME        | Database name              | edupeerhub_db         |
| JWT_SECRET     | JWT signing secret         | your_jwt_secret       |
| CLIENT_URL     | Frontend base URL          | http://localhost:5173 |
| EMAIL_ENABLED  | Enable email notifications | true                  |
| STREAM_API_KEY | Stream Chat API key        | your-stream-api-key   |
| MAILTRAP_TOKEN | Mailtrap API token         | your_mailtrap_token   |

---

## API Documentation

### Authentication

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT
- `POST /api/auth/password-reset` — Request password reset

### Tutor Management

- `GET /api/tutor` — List tutors (with filters)
- `GET /api/tutor/:id` — Get tutor profile
- `POST /api/tutor` — Create tutor profile
- `PUT /api/tutor/:id` — Update tutor profile

### Student Management

- `GET /api/student/:id` — Get student profile
- `POST /api/student` — Create student profile

### Session Booking

- `POST /api/booking` — Book a tutoring session
- `GET /api/booking/:id` — Get session details

### Admin Operations

- `GET /api/admin/users` — List all users
- `PATCH /api/admin/users/:id/restore` — Restore deleted user
- `PATCH /api/admin/tutors/:id/approve` — Approve tutor application

_For full API details, see the API documentation or use tools like Postman to explore available endpoints._

---

## Academic Use — License & Disclaimer

### License

This project is licensed under the **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)** license. See the [LICENSE](LICENSE) file for details.

You may **view** and **reference** this code for educational purposes, but you may **not**:

- Use this project or its code for commercial purposes;
- Modify, fork, or redistribute this project;
- Claim this work as your own.

### Academic Disclaimer

This repository contains code developed as part of a school project. It is intended for educational use only. Unauthorized copying, reuse, or submission of this work without explicit permission is strictly prohibited and may be considered plagiarism.

## Support & Contact

For technical support or business inquiries, please contact the Edupeerhub team via the official website.
