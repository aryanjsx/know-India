const jwt = require('jsonwebtoken');

/**
 * SECURITY: Token blacklist for invalidated tokens (logout)
 * In production, replace with Redis for distributed deployments
 * Map<token, expiryTimestamp>
 */
const tokenBlacklist = new Map();

/**
 * SECURITY: Clean up expired tokens from blacklist every 15 minutes
 * Prevents memory leaks from accumulating expired tokens
 */
setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of tokenBlacklist.entries()) {
    if (expiry < now) {
      tokenBlacklist.delete(token);
    }
  }
}, 15 * 60 * 1000);

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
 * SECURITY: Validates signature, expiry, and checks blacklist
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
function verifyToken(token) {
  try {
    if (!token || token.trim() === '') {
      return null;
    }
    
    // SECURITY: Check if token has been blacklisted (logged out)
    if (isTokenBlacklisted(token)) {
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

/**
 * SECURITY: Check if a token is blacklisted
 * @param {string} token - JWT token to check
 * @returns {boolean} True if blacklisted
 */
function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

/**
 * SECURITY: Add a token to the blacklist
 * Used during logout to invalidate tokens before expiry
 * @param {string} token - JWT token to blacklist
 */
function blacklistToken(token) {
  try {
    // Decode without verification to get expiry time
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      // Store with expiry time (in milliseconds)
      tokenBlacklist.set(token, decoded.exp * 1000);
    } else {
      // If no expiry, set to 1 hour from now
      tokenBlacklist.set(token, Date.now() + 60 * 60 * 1000);
    }
  } catch (err) {
    // If decode fails, still blacklist for 1 hour
    tokenBlacklist.set(token, Date.now() + 60 * 60 * 1000);
  }
}

module.exports = {
  generateToken,
  verifyToken,
  getJwtSecret,
  isTokenBlacklisted,
  blacklistToken,
};

