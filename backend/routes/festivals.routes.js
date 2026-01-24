const express = require('express');
const router = express.Router();
const {
  getAllFestivals,
  getFestivalBySlug,
  getFestivalBySlugAndYear,
  getReligions,
} = require('../controllers/festivals.controller');

// GET /api/festivals/filters/religions - Get distinct religions for filtering
// Must be before /:slug route to avoid conflict
router.get('/filters/religions', getReligions);

// GET /api/festivals - Get all festivals with optional filters
// Query params: religion, month, upcoming
router.get('/', getAllFestivals);

// GET /api/festivals/:slug - Get festival details by slug
router.get('/:slug', getFestivalBySlug);

// GET /api/festivals/:slug/:year - Get festival details for specific year
router.get('/:slug/:year', getFestivalBySlugAndYear);

module.exports = router;
