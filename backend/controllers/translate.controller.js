/**
 * Translation Controller
 * 
 * Handles translation API requests
 * 
 * @module controllers/translate.controller
 */

const { translateText, translateBatch, getCacheStats } = require('../services/translationService');
const { isLanguageSupported, SUPPORTED_LANGUAGES, LANGUAGE_NAMES } = require('../utils/languageCodes');

/**
 * POST /api/translate
 * Translate text to target language
 * 
 * Request body:
 * {
 *   "text": "India is a diverse country",
 *   "targetLang": "hi",
 *   "sourceLang": "en" (optional, defaults to "en")
 * }
 * 
 * Response:
 * {
 *   "translatedText": "भारत एक विविधतापूर्ण देश है",
 *   "cached": false
 * }
 */
async function translate(req, res) {
  try {
    const { text, targetLang, sourceLang = 'en' } = req.body;
    
    // Validate required fields
    if (!text) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'Text is required for translation',
      });
    }
    
    if (!targetLang) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'Target language is required',
      });
    }
    
    // Validate language codes
    if (!isLanguageSupported(targetLang)) {
      return res.status(400).json({
        error: 'Invalid language',
        message: `Unsupported target language: ${targetLang}`,
        supportedLanguages: SUPPORTED_LANGUAGES,
      });
    }
    
    if (!isLanguageSupported(sourceLang)) {
      return res.status(400).json({
        error: 'Invalid language',
        message: `Unsupported source language: ${sourceLang}`,
        supportedLanguages: SUPPORTED_LANGUAGES,
      });
    }
    
    // Limit text length to prevent abuse (max 5000 characters)
    if (text.length > 5000) {
      return res.status(400).json({
        error: 'Text too long',
        message: 'Text must be 5000 characters or less',
      });
    }
    
    // Perform translation
    const result = await translateText(text, targetLang, sourceLang);
    
    return res.status(200).json({
      translatedText: result.translatedText,
      cached: result.cached,
      sourceLang,
      targetLang,
    });
  } catch (error) {
    console.error('Translation controller error:', error.message);
    
    // Check for specific error types
    if (error.message.includes('API key')) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Translation service is not properly configured',
      });
    }
    
    if (error.message.includes('Hugging Face API error')) {
      return res.status(502).json({
        error: 'Translation service error',
        message: 'External translation service failed',
        details: error.message,
      });
    }
    
    // Fallback: return original text
    return res.status(200).json({
      translatedText: req.body.text,
      cached: false,
      fallback: true,
      error: 'Translation failed, returning original text',
    });
  }
}

/**
 * POST /api/translate/batch
 * Translate multiple texts at once
 * 
 * Request body:
 * {
 *   "texts": ["Hello", "World"],
 *   "targetLang": "hi",
 *   "sourceLang": "en"
 * }
 */
async function translateBatchHandler(req, res) {
  try {
    const { texts, targetLang, sourceLang = 'en' } = req.body;
    
    // Validate
    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Texts must be a non-empty array',
      });
    }
    
    if (texts.length > 20) {
      return res.status(400).json({
        error: 'Too many texts',
        message: 'Maximum 20 texts per batch request',
      });
    }
    
    if (!targetLang || !isLanguageSupported(targetLang)) {
      return res.status(400).json({
        error: 'Invalid language',
        message: `Unsupported target language: ${targetLang}`,
      });
    }
    
    const result = await translateBatch(texts, targetLang, sourceLang);
    
    return res.status(200).json({
      translations: result.translations,
      cached: result.cached,
      total: texts.length,
    });
  } catch (error) {
    console.error('Batch translation error:', error.message);
    return res.status(500).json({
      error: 'Batch translation failed',
      message: error.message,
    });
  }
}

/**
 * GET /api/translate/languages
 * Get list of supported languages
 */
function getSupportedLanguages(req, res) {
  const languages = SUPPORTED_LANGUAGES.map(code => ({
    code,
    name: LANGUAGE_NAMES[code],
  }));
  
  return res.status(200).json({
    languages,
    total: languages.length,
  });
}

/**
 * GET /api/translate/stats
 * Get translation cache statistics (for debugging/monitoring)
 */
function getStats(req, res) {
  const stats = getCacheStats();
  
  return res.status(200).json({
    cache: stats,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  translate,
  translateBatchHandler,
  getSupportedLanguages,
  getStats,
};
