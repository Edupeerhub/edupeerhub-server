const crypto = require("crypto");

function generateDmChannelId(userId1, userId2) {
  const ids = [userId1, userId2].sort();
  return crypto.createHash("sha256").update(ids.join("_")).digest("hex");
}
module.exports = { generateDmChannelId };
