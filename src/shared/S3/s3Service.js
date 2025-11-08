const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const logger = require("../utils/logger");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
// const { s3Client: client, isTests } = require("./s3Client");
const { r2Client: client, isTests } = require("./r2Client");

async function uploadFileToS3(file, folder = "uploads") {
  if (isTests) {
    logger.warn("⚠️ Running in test mode: S3 uploads are mocked.");
    return { key: `${folder}/${Date.now()}_${file.originalname}` };
  }

  const key = `${folder}/${Date.now()}_${file.originalname}`;

  await client.send(
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
  return await getSignedUrl(client, command, { expiresIn });
}

module.exports = { uploadFileToS3, getSignedFileUrl };
