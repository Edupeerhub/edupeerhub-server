const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Upload stream directly to S3
const uploadFileToS3 = async (file) => {
  if (!file || !file.stream) {
    throw new Error("Invalid file stream");
  }

  const fileKey = `tutors/${uuidv4()}_${file.originalname}`;

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      Body: file.stream,
      ContentType: file.mimetype,
      ACL: "private",
    },
  });

  await upload.done();

  // Key is truth; URL can be signed
  return { key: fileKey };
};

// Generate signed URL for private file
const getSignedFileUrl = async (key, expiresSeconds = 300) => {
  if (!key) throw new Error("Missing S3 key");

  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn: expiresSeconds });
};

module.exports = {
  uploadFileToS3,
  getSignedFileUrl,
};
