const express = require("express");
const httpLogger = require("./shared/middlewares/httpLogger.middleware");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const errorHandler = require("./shared/middlewares/error.middleware");
const authRoutes = require("./features/auth/auth.route");
const ApiError = require("./shared/utils/apiError");
const sendResponse = require("./shared/utils/sendResponse");
const studentRoutes = require("./features/student/student.route")

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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(httpLogger);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes)

app.get("/api/health", (req, res) => {
  sendResponse(res, 200, "Server is healthy", {
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

app.all("/{*splat}", (req, res, next) => {
  next(new ApiError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

// Error handling
app.use(errorHandler);

module.exports = app;
