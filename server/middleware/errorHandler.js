const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Axios errors (external API failure)
  if (err.isAxiosError) {
    return res.status(502).json({
      error: "Failed to reach weather service. Try again in a moment.",
    });
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
};

module.exports = errorHandler;
