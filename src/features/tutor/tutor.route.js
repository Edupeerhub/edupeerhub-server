const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const validate = require("@src/shared/middlewares/validate.middleware");

const {
  protectRoute,
  requireVerifiedUser,
} = require("@features/auth/auth.middleware");
const createRateLimiter = require("@src/shared/middlewares/rateLimit.middleware");
const rateLimitConfig = require("@src/shared/config/rateLimit.config");
const tutorController = require("./tutor.controller");
const {
  searchValidator,

  scheduleSearchValidator,
  availabilityValidator,
  canEditProfileValidator,
  updateProfileSchema,
  createProfileSchema,
} = require("./tutor.middleware");
const router = express.Router();

router.use(protectRoute);
router.use(requireVerifiedUser);

// Use memory storage to get buffer, then convert to stream
// const storage = multer.memoryStorage();
// const maxFileSize = parseInt(process.env.MAX_FILE_SIZE_BYTES || "5242880", 10);
// const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];

// const upload = multer({
//   storage,
//   limits: { fileSize: maxFileSize },
//   fileFilter: (req, file, cb) => {
//     cb(null, allowedMimeTypes.includes(file.mimetype));
//   },
// });

// direct stream
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "private",
    key: (req, file, cb) => {
      cb(null, `tutors/${Date.now()}_${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) =>
    cb(null, allowedMimeTypes.includes(file.mimetype)),
});

router.post(
  "/",
  validate(createProfileSchema),
  upload.single("document"),
  tutorController.createTutor
);
//TODO: requre tutor role for appropriate routes
router.post("/", validate(createProfileSchema), tutorController.createTutor);
router.get("/", searchValidator, tutorController.getTutors);
router.get("/recommendations", tutorController.getTutorRecommendations);
router.get("/:id", tutorController.getTutor);

router.put(
  "/:id",
  validate(updateProfileSchema),
  // canEditProfileValidator,
  tutorController.updateTutor
);

router.get(
  "/:id/schedule",
  scheduleSearchValidator,
  tutorController.getTutorSchedule
);

// POST /api/tutors/availability      // Set weekly availability
router.post(
  "/availability",
  availabilityValidator,
  tutorController.getTutorAvailability
);
// PUT /api/tutors//availability   // Update weekly availability
router.put(
  "/availability",
  availabilityValidator,
  tutorController.updateAvailability
);

router.delete("/:id/availabilty", tutorController.updateAvailability);

module.exports = router;
