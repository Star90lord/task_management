import ApiError from '../utils/ApiError.js';

/**
 * Global Error Handling Middleware
 * Catches all errors and returns consistent JSON response
 */
const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    statusCode: err.statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
  });

  // If already an ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    const apiError = new ApiError(400, 'Validation failed', errors);
    return res.status(apiError.statusCode).json(apiError.toJSON());
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const apiError = new ApiError(400, `${field} already exists`);
    return res.status(apiError.statusCode).json(apiError.toJSON());
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const apiError = new ApiError(401, 'Invalid token');
    return res.status(apiError.statusCode).json(apiError.toJSON());
  }

  if (err.name === 'TokenExpiredError') {
    const apiError = new ApiError(401, 'Token expired');
    return res.status(apiError.statusCode).json(apiError.toJSON());
  }

  // Default 500 error
  const apiError = new ApiError(500, err.message || 'Internal Server Error');
  res.status(apiError.statusCode).json(apiError.toJSON());
};

export default errorMiddleware;