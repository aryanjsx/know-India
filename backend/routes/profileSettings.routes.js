const express = require('express');
const { authRequired } = require('../middleware/auth.middleware');
const { upload, handleMulterError } = require('../config/multer');
const {
  getProfile,
  updateProfile,
} = require('../controllers/profileSettings.controller');

const router = express.Router();

// GET /api/profile/settings - Get current user profile
router.get('/', authRequired, getProfile);

// PUT /api/profile/settings - Update user profile (name and avatar)
router.put(
  '/',
  authRequired,
  upload.single('avatar'),
  handleMulterError,
  updateProfile
);

module.exports = router;

