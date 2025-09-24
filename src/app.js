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

const chatRoutes = require("@features/chat/chat.route");
const ApiError = require("@utils/apiError");
const sendResponse = require("@utils/sendResponse");
const reviewRoutes = require("@features/reviews/review.route");

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

const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure multer with S3 storage, file size limit & file type filter
const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "private", // keep bucket private
    key: (req, file, cb) => {
      cb(null, `uploads/${Date.now()}_${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, JPG, and PNG allowed."));
    }
  },
});

// Upload route
app.post("/upload", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({
      message: "File uploaded successfully!",
      key: req.file.key, // stored key in S3
      bucket: req.file.bucket,
    });
  });
});

// Generate signed URL for file download
app.get("/file/:key", (req, res) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `uploads/${req.params.key}`,
    Expires: 60, // 60 seconds
  };

  try {
    const url = s3.getSignedUrl("getObject", params);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: "Error generating signed URL" });
  }
});
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subject", subjectRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/reviews", reviewRoutes);

app.use("/api/chat", chatRoutes);

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
