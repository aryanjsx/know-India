const jwt = require('jsonwebtoken');

/**
 * SECURITY: Get JWT secret with strict validation
 * Fails fast if secret is not configured
 */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is required');
  }
  if (secret.length < 32) {
    console.warn('SECURITY WARNING: JWT_SECRET should be at least 32 characters');
  }
  return secret;
};

/**
 * Generate a JWT token for a user
 * SECURITY: Shorter expiry (1 hour) for public website
 * @param {Object} user - User object with id, email, role, name, avatar
 * @returns {string} JWT token
 */
function generateToken(user) {
  // SECURITY: Minimal payload - only include necessary data
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name || null,
    avatar: user.avatar || null,
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: '1h', // SECURITY: Shorter expiry for public-facing app
    algorithm: 'HS256',
  });
}

/**
 * Verify and decode a JWT token
 * SECURITY: Validates signature and expiry
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
function verifyToken(token) {
  try {
    if (!token || token.trim() === '') {
      return null;
    }
    return jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'], // SECURITY: Specify allowed algorithms
    });
  } catch (err) {
    // SECURITY: Don't log token contents, only error type
    if (err.name !== 'TokenExpiredError') {
      console.error('JWT verification failed:', err.name);
    }
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
  getJwtSecret,
};

