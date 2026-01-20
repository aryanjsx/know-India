/**
 * Translation Controller
 * 
 * Handles HTTP requests for the translation API.
 * Implements request validation, error handling, and response formatting.
 * 
 * @module controllers/translate.controller
 */

const { translateText, translateBatch, getCacheStats, clearCache } = require('../services/translationService');
const { isLanguageSupported, getAllLanguages } = require('../utils/languageCodes');

// =============================================================================
// SINGLE TEXT TRANSLATION
// =============================================================================

/**
 * Translate single text
 * 
 * POST /api/translate
 * 
 * Request body:
 * {
 *   "text": "Text to translate",
 *   "targetLang": "hi",
 *   "sourceLang": "en" // optional, defaults to 'en'
 * }
 * 
 * Response:
 * {
 *   "translatedText": "अनुवादित पाठ",
 *   "cached": false,
 *   "sourceLang": "en",
 *   "targetLang": "hi"
 * }
 */
async function translate(req, res) {
  try {
    const { text, targetLang, sourceLang = 'en' } = req.body;
    
    // =========================================================================
    // REQUEST VALIDATION
    // =========================================================================
    
    // Validate text
    if (!text) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Text is required',
      });
    }
    
    if (typeof text !== 'string') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Text must be a string',
      });
    }
    
    // Validate target language
    if (!targetLang) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Target language (targetLang) is required',
      });
    }
    
    if (!isLanguageSupported(targetLang)) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Unsupported target language: ${targetLang}`,
        supportedLanguages: getAllLanguages().map(l => l.code),
      });
    }
    
    // Validate source language
    if (!isLanguageSupported(sourceLang)) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Unsupported source language: ${sourceLang}`,
        supportedLanguages: getAllLanguages().map(l => l.code),
      });
    }
    
    // =========================================================================
    // TRANSLATE
    // =========================================================================
    
    // If target is same as source, return original text
    if (targetLang === sourceLang) {
      return res.json({
        translatedText: text,
        cached: false,
        sourceLang,
        targetLang,
      });
    }
    
    const result = await translateText(text, targetLang, sourceLang);
    
    return res.json({
      translatedText: result.translatedText,
      cached: result.cached,
      sourceLang,
      targetLang,
    });
    
  } catch (error) {
    console.error('[TranslateController] Translation error:', error.message);
    
    // =========================================================================
    // ERROR HANDLING WITH FALLBACK
    // =========================================================================
    
    // Log the error for debugging
    console.error('[TranslateController] Full error:', error);
    
    // Return error response with original text as fallback
    return res.status(500).json({
      error: 'Translation service error',
      message: 'External translation service failed',
      details: error.message,
      // Include original text so frontend can use as fallback
      fallbackText: req.body.text,
    });
  }
}

// =============================================================================
// BATCH TRANSLATION
// =============================================================================

/**
 * Translate multiple texts in batch
 * 
 * POST /api/translate/batch
 * 
 * Request body:
 * {
 *   "texts": ["Text 1", "Text 2"],
 *   "targetLang": "hi",
 *   "sourceLang": "en" // optional
 * }
 * 
 * Response:
 * {
 *   "translations": ["अनुवाद 1", "अनुवाद 2"],
 *   "cachedCount": 1,
 *   "sourceLang": "en",
 *   "targetLang": "hi"
 * }
 */
async function translateBatchHandler(req, res) {
  try {
    const { texts, targetLang, sourceLang = 'en' } = req.body;
    
    // Validate texts array
    if (!texts || !Array.isArray(texts)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Texts must be an array',
      });
    }
    
    if (texts.length === 0) {
      return res.json({
        translations: [],
        cachedCount: 0,
        sourceLang,
        targetLang,
      });
    }
    
    // Limit batch size to prevent abuse
    const MAX_BATCH_SIZE = 10;
    if (texts.length > MAX_BATCH_SIZE) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Batch size exceeds maximum of ${MAX_BATCH_SIZE} texts`,
      });
    }
    
    // Validate language codes
    if (!targetLang || !isLanguageSupported(targetLang)) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Unsupported target language: ${targetLang}`,
      });
    }
    
    if (!isLanguageSupported(sourceLang)) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Unsupported source language: ${sourceLang}`,
      });
    }
    
    // If target is same as source, return original texts
    if (targetLang === sourceLang) {
      return res.json({
        translations: texts,
        cachedCount: 0,
        sourceLang,
        targetLang,
      });
    }
    
    const result = await translateBatch(texts, targetLang, sourceLang);
    
    return res.json({
      translations: result.translations,
      cachedCount: result.cachedCount,
      sourceLang,
      targetLang,
    });
    
  } catch (error) {
    console.error('[TranslateController] Batch translation error:', error.message);
    
    return res.status(500).json({
      error: 'Translation service error',
      message: 'Batch translation failed',
      details: error.message,
      fallbackTexts: req.body.texts,
    });
  }
}

// =============================================================================
// UTILITY ENDPOINTS
// =============================================================================

/**
 * Get list of supported languages
 * 
 * GET /api/translate/languages
 * 
 * Response:
 * {
 *   "languages": [
 *     { "code": "en", "name": "English", "nativeName": "English" },
 *     { "code": "hi", "name": "Hindi", "nativeName": "हिन्दी" },
 *     ...
 *   ]
 * }
 */
function getSupportedLanguages(req, res) {
  const languages = getAllLanguages();
  
  return res.json({
    languages,
    count: languages.length,
  });
}

/**
 * Get cache statistics (for monitoring/debugging)
 * 
 * GET /api/translate/stats
 * 
 * Response:
 * {
 *   "cache": { "size": 150, "maxSize": 1000, "ttlHours": 24 }
 * }
 */
function getStats(req, res) {
  return res.json({
    cache: getCacheStats(),
  });
}

/**
 * Clear translation cache (admin only - should be protected in production)
 * 
 * POST /api/translate/clear-cache
 */
function clearTranslationCache(req, res) {
  clearCache();
  
  return res.json({
    message: 'Cache cleared successfully',
  });
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  translate,
  translateBatch: translateBatchHandler,
  getSupportedLanguages,
  getStats,
  clearTranslationCache,
};
