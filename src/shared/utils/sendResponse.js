/**
 * Use this to standardize success responses across all controllers.
 * Example:
 * sendResponse(res, "User created successfully", 201,  createdUser);
 */

const sendResponse = (
  res,
  statusCode = 200,
  message = "Success",
  data = null
) => {
  if (data?.meta) {
    // Special case for paginated responses
    return res.status(statusCode).json({
      success: true,
      message,
      ...data,
    });
  }

  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

module.exports = sendResponse;
