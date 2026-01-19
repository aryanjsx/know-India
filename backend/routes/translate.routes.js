/**
 * Translation Routes
 * 
 * POST /api/translate - Translate text
 * POST /api/translate/batch - Translate multiple texts
 * GET /api/translate/languages - Get supported languages
 * GET /api/translate/stats - Get cache statistics
 * 
 * Includes rate limiting to prevent abuse
 */

const express = require('express');
const router = express.Router();
const {
  translate,
  translateBatchHandler,
  getSupportedLanguages,
  getStats,
} = require('../controllers/translate.controller');

// ============================================
// Simple In-Memory Rate Limiter
// ============================================

const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;  // 1 minute window
const RATE_LIMIT_MAX = 30;            // Max 30 requests per minute per IP

/**
 * Rate limiting middleware
 * Limits requests per IP address
 */
function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Get or create rate limit entry for this IP
  let entry = rateLimitStore.get(ip);
  
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    // New window
    entry = {
      windowStart: now,
      count: 1,
    };
    rateLimitStore.set(ip, entry);
  } else {
    // Existing window - increment count
    entry.count++;
    
    if (entry.count > RATE_LIMIT_MAX) {
      const retryAfter = Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW - now) / 1000);
      
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many translation requests. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      });
    }
  }
  
  // Clean up old entries periodically (every 100 requests)
  if (Math.random() < 0.01) {
    const cutoff = now - RATE_LIMIT_WINDOW;
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.windowStart < cutoff) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  next();
}

// ============================================
// Routes
// ============================================

// GET /api/translate/languages - Get supported languages (no rate limit)
router.get('/languages', getSupportedLanguages);

// GET /api/translate/stats - Get cache statistics (no rate limit)
router.get('/stats', getStats);

// POST /api/translate - Translate single text (rate limited)
router.post('/', rateLimiter, translate);

// POST /api/translate/batch - Translate multiple texts (rate limited)
router.post('/batch', rateLimiter, translateBatchHandler);

module.exports = router;
