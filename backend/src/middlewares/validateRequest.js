export const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Request validation failed",
      errors: result.error.issues.map(({ path, message }) => ({ path: path.join("."), message })),
    });
  }

  req.body = result.data.body;
  req.params = result.data.params;
  res.locals.validatedQuery = result.data.query;
  next();
};
