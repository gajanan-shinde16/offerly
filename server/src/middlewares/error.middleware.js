export const errorHandler = (err, req, res, next) => {
  // Zod v4 validation error
  if (err && Array.isArray(err.issues)) {
    return res.status(400).json({
      success: false,
      errors: err.issues.map(issue => ({
        field: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  // Other errors (server-side)
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
