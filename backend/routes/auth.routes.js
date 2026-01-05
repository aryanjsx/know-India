const express = require('express');
const passport = require('passport');
const { connectToDatabase } = require('../utils/db');
const { generateToken } = require('../utils/jwt');

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

module.exports = router;
