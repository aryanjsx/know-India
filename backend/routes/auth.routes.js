const express = require('express');
const passport = require('passport');
const { connectToDatabase } = require('../utils/db');
const { generateToken, blacklistToken, verifyToken } = require('../utils/jwt');

const router = express.Router();

/**
 * Find user by Google ID or create a new user
 * @param {Object} profile - Google profile data
 * @returns {Object} User from database
 */
async function findOrCreateUser(profile) {
  const connection = await connectToDatabase();

  // Check if user exists
  const [existingUsers] = await connection.execute(
    'SELECT * FROM users WHERE google_id = ?',
    [profile.id]
  );

  if (existingUsers.length > 0) {
    // User exists, return it
    return existingUsers[0];
  }

  // Create new user
  const [result] = await connection.execute(
    `INSERT INTO users (google_id, name, email, avatar, role) VALUES (?, ?, ?, ?, ?)`,
    [
      profile.id,
      profile.displayName,
      profile.email,
      profile.photo,
      'user',
    ]
  );

  // Fetch the newly created user
  const [newUsers] = await connection.execute(
    'SELECT * FROM users WHERE id = ?',
    [result.insertId]
  );

  return newUsers[0];
}

// GET /auth/google - Start Google OAuth flow
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// GET /auth/google/callback - Handle Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/auth/failure',
  }),
  async (req, res) => {
    try {
      // Find or create user in database
      const user = await findOrCreateUser(req.user);

      // Generate JWT token
      const token = generateToken(user);

      // Get frontend URL from environment (production default)
      const clientUrl = process.env.CLIENT_URL || 'https://knowindia.vercel.app';

      // Redirect to frontend with token
      res.redirect(`${clientUrl}/auth/success?token=${token}`);
    } catch (err) {
      console.error('OAuth callback error:', err.message);
      const clientUrl = process.env.CLIENT_URL || 'https://knowindia.vercel.app';
      res.redirect(`${clientUrl}/auth/failure?error=${encodeURIComponent(err.message)}`);
    }
  }
);

// GET /auth/failure - Handle authentication failure
router.get('/failure', (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'https://knowindia.vercel.app';
  res.redirect(`${clientUrl}/auth/failure?error=authentication_failed`);
});

/**
 * GET /auth/logout - Logout user and invalidate token
 * SECURITY: Blacklists the token to prevent reuse
 */
router.get('/logout', (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // SECURITY: Blacklist the token to prevent reuse after logout
      if (token && token.trim() !== '') {
        blacklistToken(token);
      }
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    console.error('Logout error:', err.message);
    // Still return success - user wanted to logout
    res.json({
      success: true,
      message: 'Logged out',
    });
  }
});

/**
 * POST /auth/logout - Logout user (POST method for better security)
 * SECURITY: POST is preferred for logout to prevent CSRF via GET
 */
router.post('/logout', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token && token.trim() !== '') {
        blacklistToken(token);
      }
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.json({
      success: true,
      message: 'Logged out',
    });
  }
});

/**
 * GET /auth/status - Check authentication status
 * SECURITY: Returns user info if token is valid, null otherwise
 */
router.get('/status', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({
        authenticated: false,
        user: null,
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.json({
        authenticated: false,
        user: null,
      });
    }
    
    // SECURITY: Verify user still exists in database
    const connection = await connectToDatabase();
    const [users] = await connection.execute(
      'SELECT id, email, name, role, avatar FROM users WHERE id = ?',
      [decoded.id]
    );
    
    if (users.length === 0) {
      return res.json({
        authenticated: false,
        user: null,
      });
    }
    
    res.json({
      authenticated: true,
      user: {
        id: users[0].id,
        email: users[0].email,
        name: users[0].name,
        role: users[0].role,
        avatar: users[0].avatar,
      },
    });
  } catch (err) {
    // SECURITY: Don't expose error details, just return unauthenticated
    res.json({
      authenticated: false,
      user: null,
    });
  }
});

/**
 * GET /auth/me - Get current user info (requires valid token)
 * SECURITY: Validates token and returns user profile
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided',
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid or expired token',
      });
    }
    
    // SECURITY: Always verify user exists in database
    const connection = await connectToDatabase();
    const [users] = await connection.execute(
      'SELECT id, email, name, role, avatar FROM users WHERE id = ?',
      [decoded.id]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found',
      });
    }
    
    res.json({
      success: true,
      user: {
        id: users[0].id,
        email: users[0].email,
        name: users[0].name,
        role: users[0].role,
        avatar: users[0].avatar,
      },
    });
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user info',
    });
  }
});

module.exports = router;
