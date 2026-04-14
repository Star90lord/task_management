import jwt from 'jsonwebtoken';

/**
 * Generate JWT Token
 * @param {string} userId - User ID (can be from PostgreSQL or MongoDB)
 * @param {string} userEmail - User email
 * @returns {string} JWT token
 */
const generateToken = (userId, userEmail) => {
  const token = jwt.sign(
    {
      userId,
      email: userEmail,
    },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    {
      expiresIn: process.env.JWT_EXPIRY || '7d',
    }
  );
  return token;
};

/**
 * Verify JWT Token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    return decoded;
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

export { generateToken, verifyToken };