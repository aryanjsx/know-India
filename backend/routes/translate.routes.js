/**
 * Translation API Routes
 * 
 * Defines routes for the translation API with rate limiting.
 * 
 * Routes:
 * - POST /api/translate - Translate single text
 * - POST /api/translate/batch - Translate multiple texts
 * - GET /api/translate/languages - Get supported languages
 * - GET /api/translate/stats - Get cache statistics
 * 
 * @module routes/translate.routes
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  translate,
  translateBatch,
  getSupportedLanguages,
  getStats,
  clearTranslationCache,
} = require('../controllers/translate.controller');

const router = express.Router();

// =============================================================================
// RATE LIMITING CONFIGURATION
// =============================================================================

/**
 * Rate limiter for translation endpoints
 * 
 * Limits requests to prevent abuse and manage API costs.
 * - 30 requests per minute per IP for single translations
 * - 10 requests per minute per IP for batch translations
 */
const translationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30, // 30 requests per minute
  message: {
    error: 'Rate limit exceeded',
    message: 'Too many translation requests. Please try again in a minute.',
    retryAfter: 60,
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

const batchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // 10 batch requests per minute
  message: {
    error: 'Rate limit exceeded',
    message: 'Too many batch translation requests. Please try again in a minute.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// =============================================================================
// ROUTES
// =============================================================================

/**
 * @route   POST /api/translate
 * @desc    Translate single text to target language
 * @access  Public (rate limited)
 * 
 * @body    {string} text - Text to translate
 * @body    {string} targetLang - Target language code (e.g., 'hi', 'ta')
 * @body    {string} [sourceLang='en'] - Source language code
 * 
 * @returns {Object} { translatedText, cached, sourceLang, targetLang }
 */
router.post('/', translationLimiter, translate);

/**
 * @route   POST /api/translate/batch
 * @desc    Translate multiple texts in batch (max 10)
 * @access  Public (rate limited)
 * 
 * @body    {string[]} texts - Array of texts to translate
 * @body    {string} targetLang - Target language code
 * @body    {string} [sourceLang='en'] - Source language code
 * 
 * @returns {Object} { translations, cachedCount, sourceLang, targetLang }
 */
router.post('/batch', batchLimiter, translateBatch);

/**
 * @route   GET /api/translate/languages
 * @desc    Get list of supported languages
 * @access  Public
 * 
 * @returns {Object} { languages: [...], count }
 */
router.get('/languages', getSupportedLanguages);

/**
 * @route   GET /api/translate/stats
 * @desc    Get translation cache statistics
 * @access  Public (should be protected in production)
 * 
 * @returns {Object} { cache: { size, maxSize, ttlHours } }
 */
router.get('/stats', getStats);

/**
 * @route   POST /api/translate/clear-cache
 * @desc    Clear translation cache
 * @access  Should be admin-only in production
 * 
 * @returns {Object} { message }
 */
router.post('/clear-cache', clearTranslationCache);

module.exports = router;
