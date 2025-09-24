// const AWS = require("aws-sdk");
// require("dotenv").config();

// const s3 = new AWS.S3({
//   region: process.env.AWS_REGION,
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });

// // Create a new bucket
// const createBucket = async (bucketName) => {
//   try {
//     const params = {
//       Bucket: bucketName,
//       ACL: "private", // keep bucket private
//     };
//     const data = await s3.createBucket(params).promise();
//     console.log("Bucket created successfully:", data.Location);
//     return data.Location;
//   } catch (err) {
//     console.error("Error creating bucket:", err.message);
//     throw err;
//   }
// };

// // Example usage
// createBucket("edupeerhub-uploads-2025");

const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

s3.listBuckets((err, data) => {
  if (err) console.error(err);
  else console.log("Buckets:", data.Buckets);
});
