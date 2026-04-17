import jwt from 'jsonwebtoken';

/**
 * Generate JWT Token
 * @param {string} userId - User ID (can be from PostgreSQL or MongoDB)
 * @param {string} userEmail - User email
 * @returns {string} JWT token
 */
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

const generateToken = (userId, userEmail) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  return jwt.sign(
    {
      userId,
      email: userEmail,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRY,
    }
  );
};

/**
 * Verify JWT Token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

export { generateToken, verifyToken };