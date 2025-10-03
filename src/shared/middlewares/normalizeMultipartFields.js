const ApiError = require("../utils/apiError");

// middleware to normalize multipart fields
function normalizeMultipartFields(req, res, next) {
  if (req.body.subjects && typeof req.body.subjects === "string") {
    try {
      req.body.subjects = JSON.parse(req.body.subjects);
    } catch (e) {
      return next(new ApiError("Invalid subjects format", 400));
    }
  }
  next();
}

module.exports = normalizeMultipartFields;
