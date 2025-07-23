/**
 * Use this to standardize success responses across all controllers.
 * Example:
 * sendResponse(res, 201, "User created successfully", createdUser);
 */

const sendResponse = (
  res,
  statusCode = 200,
  message = "Success",
  data = null
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

module.exports = sendResponse;
