const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const logger = require("./logger");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const ApiError = require("./apiError");

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

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadFileToS3(file, folder = "uploads") {
  if (isTests) {
    logger.warn("⚠️ Running in test mode: S3 uploads are mocked.");
    return { key: `${folder}/${Date.now()}_${file.originalname}` };
  }

  const key = `${folder}/${Date.now()}_${file.originalname}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return { key };
}

async function getSignedFileUrl(key, expiresIn = 300) {
  if (isTests) {
    logger.warn("⚠️ Running in test mode: S3 URLs are mocked.");
    return `https://example.com/dev-s3-bucket/${key}`; // Mock URL for tests
  }
  // default 5 min
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });
  return await getSignedUrl(s3, command, { expiresIn });
}

module.exports = { uploadFileToS3, getSignedFileUrl };
