const cloudinary = require("cloudinary").v2;

/**
 * Generate transformed profile picture URLs
 * @param {string} publicId - Cloudinary public_id (not full URL!)
 */
function getProfilePicUrls(publicId) {
  return {
    small: cloudinary.url(publicId, {
      width: 100,
      height: 100,
      crop: "fill",
      gravity: "face",
      radius: "max", // round
      secure: true, // always use https
    }),
    medium: cloudinary.url(publicId, {
      width: 400,
      height: 400,
      crop: "fill",
      gravity: "face",
      radius: "max",
      secure: true,
    }),
    large: cloudinary.url(publicId, {
      width: 800,
      crop: "scale",
      radius: "max",
      secure: true,
    }),
  };
}

module.exports = { getProfilePicUrls };
