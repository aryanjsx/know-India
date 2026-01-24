const express = require('express');
const router = express.Router();
const {
  getAllFestivals,
  getFestivalBySlug,
  getFestivalBySlugAndYear,
  getReligions,
  getRegions,
} = require('../controllers/festivals.controller');

// GET /api/festivals/filters/religions - Get distinct religions for filtering
// Must be before /:slug route to avoid conflict
router.get('/filters/religions', getReligions);

// GET /api/festivals/filters/regions - Get regions for filtering
router.get('/filters/regions', getRegions);

// GET /api/festivals - Get all festivals with optional filters
// Query params: religion, month, upcoming, region
router.get('/', getAllFestivals);

// GET /api/festivals/:slug - Get festival details by slug
router.get('/:slug', getFestivalBySlug);

// GET /api/festivals/:slug/:year - Get festival details for specific year
router.get('/:slug/:year', getFestivalBySlugAndYear);

module.exports = router;
