const express = require('express');
const router = express.Router();
const { 
  generateItinerary, 
  searchPlaces,
  getDestinations, 
  getStatus,
  saveItinerary,
  getItineraryById,
  generateItineraryPdf,
  getMyItineraries,
} = require('../controllers/itinerary.controller');
const { authOptional, authRequired } = require('../middleware/auth.middleware');

// GET /api/itinerary/destinations - Get available destinations
router.get('/destinations', getDestinations);

// GET /api/itinerary/status - Get vector search status
router.get('/status', getStatus);

// GET /api/itinerary/my-itineraries - Get user's saved itineraries (auth required)
router.get('/my-itineraries', authRequired, getMyItineraries);

// POST /api/itinerary/search - Vector search for places
router.post('/search', searchPlaces);

// POST /api/itinerary/save - Save itinerary to database (auth optional)
router.post('/save', authOptional, saveItinerary);

// POST /api/itinerary - Generate AI-powered travel itinerary
router.post('/', generateItinerary);

// GET /api/itinerary/:id/pdf - Generate PDF version of itinerary
router.get('/:id/pdf', generateItineraryPdf);

// GET /api/itinerary/:id - Get itinerary by ID (must be after specific routes)
router.get('/:id', getItineraryById);

module.exports = router;
