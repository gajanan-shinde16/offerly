export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Forward the ACTUAL ZodError object
      return next(result.error);
    }

    // Replace body with validated data (clean input!)
    req.body = result.data;
    next();
  };
};
