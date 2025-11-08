const { S3Client } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
const ApiError = require("../utils/apiError");
dotenv.config();

const isTests = process.env.NODE_ENV === "test";

if (
  !isTests &&
  (!process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY ||
    !process.env.S3_BUCKET_NAME ||
    !process.env.AWS_REGION)
) {
  throw new ApiError("Missing S3 environment variables");
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = { s3Client, isTests };
