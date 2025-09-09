const express = require("express");
const httpLogger = require("@src/shared/middlewares/httpLogger.middleware");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const studentRoutes = require("@features/student/student.route");
const errorHandler = require("@src/shared/middlewares/error.middleware");
const authRoutes = require("@features/auth/auth.route");
const userRoutes = require("@features/user/user.route");
const tutorRoutes = require("@features/tutor/tutor.route");
const adminRoutes = require("@features/admin/admin.route");
const subjectRoutes = require("@features/subject/subject.route");
const examRoutes = require("@features/exams/exams.route");
const ApiError = require("@utils/apiError");
const sendResponse = require("@utils/sendResponse");

const app = express();

// Trust first proxy
app.set("trust proxy", 1);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(httpLogger);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subject", subjectRoutes);
app.use("/api/exam", examRoutes);

app.get("/api/health", (req, res) => {
  sendResponse(res, 200, "Server is healthy", {
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.all("/{*splat}", (req, res, next) => {
  next(new ApiError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

// Error handling
app.use(errorHandler);

module.exports = app;
