export const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
};

export const errorHandler = (error, req, res, _next) => {
  req.log?.error({ err: error }, "Request failed");

  if (res.headersSent) return;

  const status = error.status || (error.name === "ValidationError" ? 400 : 500);
  const message = status >= 500 ? "Internal server error" : error.message;
  res.status(status).json({ success: false, message });
};
