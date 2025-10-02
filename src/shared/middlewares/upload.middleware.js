const multer = require("multer");
const ApiError = require("@utils/apiError");

const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
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
  },
});

module.exports = {
  uploadSingle: upload.single("file"),
};
