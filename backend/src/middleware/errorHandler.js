const { ZodError } = require('zod');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `${field} already exists` });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
};

module.exports = errorHandler;