import { verifyToken } from '../utils/generateToken.js';
import ApiError from '../utils/ApiError.js';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Access token is missing');
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(error.toJSON());
    }

    const apiError = new ApiError(
      401,
      error.message || 'Invalid or expired token',
      []
    );
    res.status(apiError.statusCode).json(apiError.toJSON());
  }
};

export default authMiddleware;