const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("@src/shared/config/cloudinary");
const ApiError = require("@utils/apiError");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ------------------
// S3 Uploads (PDFs + images)
// ------------------
const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

const memoryStorage = multer.memoryStorage();

const s3FileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError("Invalid file type", 400, {
        allowed: allowedTypes,
        received: file.mimetype,
      })
    );
  }
};

const uploadS3 = multer({
  storage: memoryStorage,
  fileFilter: s3FileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// ------------------
// Cloudinary Uploads (User profile pics)
// ------------------
const folder =
  process.env.NODE_ENV === "production" ? "user_profiles" : "dev_user_profiles";

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: folder,
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    // transformation: [
    //   { width: 400, height: 400, crop: "fill", gravity: "face" }, // square crop, focus on face
    // ],
  },
});

const cloudinaryFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new ApiError("Only image files are allowed!", 400));
  }
};

const uploadCloudinary = multer({
  storage: cloudinaryStorage,
  fileFilter: cloudinaryFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// ------------------
// Exports
// ------------------
module.exports = {
  uploadSingleS3: uploadS3.single("file"), // Tutor docs → S3
  uploadSingleProfilePic: uploadCloudinary.single("file"), // User profile pics → Cloudinary
};
