/**
 * Translation Service for Know India
 * 
 * Handles translation using Hugging Face Inference API with IndicTrans2 model.
 * Implements in-memory caching to reduce API calls and improve performance.
 * 
 * Model: ai4bharat/indictrans2-indic-indic-1B
 * 
 * @module services/translationService
 */

const { isLanguageSupported } = require('../utils/languageCodes');

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Hugging Face API base URL
 * Note: Using router.huggingface.co (new endpoint as of 2024)
 */
const HF_API_BASE = 'https://router.huggingface.co/hf-inference/models';

/**
 * Model mapping for different target languages
 * Using Helsinki-NLP opus-mt models which are well-supported on HF Inference API
 * For languages without Helsinki support, we use a fallback approach
 */
const TRANSLATION_MODELS = {
  hi: 'Helsinki-NLP/opus-mt-en-hi',    // English to Hindi
  ur: 'Helsinki-NLP/opus-mt-en-ur',    // English to Urdu
  // For other languages, we'll use the multilingual model
  default: 'facebook/mbart-large-50-many-to-many-mmt'
};

/**
 * MBART language codes for languages not supported by Helsinki-NLP
 */
const MBART_LANG_CODES = {
  en: 'en_XX',
  hi: 'hi_IN',
  ta: 'ta_IN',
  te: 'te_IN',
  bn: 'bn_IN',
  mr: 'mr_IN',
  gu: 'gu_IN',
  kn: 'kn_IN',
  ml: 'ml_IN',
  pa: 'pa_IN',
  or: 'or_IN',
  ur: 'ur_PK',
  ne: 'ne_NP',
};

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  MAX_SIZE: 1000,           // Maximum number of cached translations
  TTL: 24 * 60 * 60 * 1000, // Time-to-live: 24 hours in milliseconds
};

/**
 * Retry configuration for handling model loading (503 errors)
 */
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 5000,  // 5 seconds
  MAX_DELAY: 30000,     // 30 seconds
};

// =============================================================================
// IN-MEMORY CACHE
// =============================================================================

/**
 * Translation cache storage
 * Structure: Map<cacheKey, { translation: string, timestamp: number }>
 */
const translationCache = new Map();

/**
 * Generate a hash for cache key
 * Simple but effective hash function for strings
 * 
 * @param {string} str - String to hash
 * @returns {string} Hash string
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generate cache key for a translation request
 * 
 * @param {string} text - Source text
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @returns {string} Cache key
 */
function getCacheKey(text, sourceLang, targetLang) {
  return `${sourceLang}:${targetLang}:${hashString(text)}`;
}

/**
 * Get translation from cache if exists and not expired
 * 
 * @param {string} key - Cache key
 * @returns {string|null} Cached translation or null
 */
function getFromCache(key) {
  const cached = translationCache.get(key);
  
  if (!cached) {
    return null;
  }
  
  // Check if cache entry has expired
  if (Date.now() - cached.timestamp > CACHE_CONFIG.TTL) {
    translationCache.delete(key);
    return null;
  }
  
  return cached.translation;
}

/**
 * Store translation in cache
 * Implements LRU-style eviction when cache is full
 * 
 * @param {string} key - Cache key
 * @param {string} translation - Translated text
 */
function setInCache(key, translation) {
  // Evict oldest entry if cache is full
  if (translationCache.size >= CACHE_CONFIG.MAX_SIZE) {
    const oldestKey = translationCache.keys().next().value;
    translationCache.delete(oldestKey);
  }
  
  translationCache.set(key, {
    translation,
    timestamp: Date.now(),
  });
}

/**
 * Clear all cached translations
 */
function clearCache() {
  translationCache.clear();
  console.log('[TranslationService] Cache cleared');
}

/**
 * Get cache statistics
 * 
 * @returns {Object} Cache statistics
 */
function getCacheStats() {
  return {
    size: translationCache.size,
    maxSize: CACHE_CONFIG.MAX_SIZE,
    ttlHours: CACHE_CONFIG.TTL / (60 * 60 * 1000),
  };
}

// =============================================================================
// HUGGING FACE API INTERACTION
// =============================================================================

/**
 * Get the appropriate model URL for the target language
 * 
 * @param {string} targetLang - Target language code
 * @returns {string} Full API URL for the model
 */
function getModelUrl(targetLang) {
  const model = TRANSLATION_MODELS[targetLang] || TRANSLATION_MODELS.default;
  return `${HF_API_BASE}/${model}`;
}

/**
 * Check if we should use the Helsinki model (direct translation)
 * 
 * @param {string} targetLang - Target language code
 * @returns {boolean} True if Helsinki model is available
 */
function useHelsinkiModel(targetLang) {
  return TRANSLATION_MODELS[targetLang] && targetLang !== 'default';
}

/**
 * Call Hugging Face Inference API for translation
 * Handles retries for model loading (503 errors)
 * 
 * @param {string} inputText - Text to translate
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<string>} Translated text
 * @throws {Error} If API call fails after all retries
 */
async function callHuggingFaceAPI(inputText, sourceLang, targetLang, retryCount = 0) {
  const apiKey = process.env.HF_API_KEY;
  
  if (!apiKey) {
    throw new Error('HF_API_KEY environment variable is not configured');
  }
  
  const modelUrl = getModelUrl(targetLang);
  const isHelsinkiModel = useHelsinkiModel(targetLang);
  
  console.log(`[TranslationService] Calling HF API: ${modelUrl} (attempt ${retryCount + 1}/${RETRY_CONFIG.MAX_RETRIES + 1})`);
  
  // Build request body based on model type
  let requestBody;
  if (isHelsinkiModel) {
    // Helsinki models accept direct text input
    requestBody = {
      inputs: inputText,
      options: { wait_for_model: true },
    };
  } else {
    // MBART requires source and target language specification
    const srcLang = MBART_LANG_CODES[sourceLang] || 'en_XX';
    const tgtLang = MBART_LANG_CODES[targetLang];
    
    if (!tgtLang) {
      throw new Error(`Language ${targetLang} not supported by translation model`);
    }
    
    requestBody = {
      inputs: inputText,
      parameters: {
        src_lang: srcLang,
        tgt_lang: tgtLang,
      },
      options: { wait_for_model: true },
    };
  }
  
  try {
    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    // Handle model loading (503 Service Unavailable)
    if (response.status === 503) {
      if (retryCount < RETRY_CONFIG.MAX_RETRIES) {
        const errorData = await response.json().catch(() => ({}));
        const estimatedTime = errorData.estimated_time || 20;
        const delay = Math.min(
          RETRY_CONFIG.INITIAL_DELAY * Math.pow(2, retryCount),
          RETRY_CONFIG.MAX_DELAY
        );
        
        console.log(`[TranslationService] Model loading, waiting ${delay/1000}s (estimated: ${estimatedTime}s)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return callHuggingFaceAPI(inputText, sourceLang, targetLang, retryCount + 1);
      }
      throw new Error('Model loading timeout - please try again later');
    }
    
    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HF API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }
    
    // Parse response
    const data = await response.json();
    console.log('[TranslationService] API Response:', JSON.stringify(data).substring(0, 200));
    
    // Handle different response formats from HF API
    if (Array.isArray(data) && data[0]?.translation_text) {
      return data[0].translation_text;
    }
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text;
    }
    if (data.translation_text) {
      return data.translation_text;
    }
    if (data.generated_text) {
      return data.generated_text;
    }
    if (typeof data === 'string') {
      return data;
    }
    
    // If response format is unexpected, log and throw
    console.error('[TranslationService] Unexpected response format:', JSON.stringify(data).substring(0, 200));
    throw new Error('Unexpected response format from translation API');
    
  } catch (error) {
    // Re-throw with context
    if (error.message.includes('HF API error') || error.message.includes('timeout')) {
      throw error;
    }
    throw new Error(`Translation API request failed: ${error.message}`);
  }
}

// =============================================================================
// MAIN TRANSLATION FUNCTION
// =============================================================================

/**
 * Translate text to target language
 * 
 * This is the main function to translate text. It:
 * 1. Validates input and language codes
 * 2. Checks cache for existing translation
 * 3. Calls Hugging Face API if not cached
 * 4. Caches the result for future use
 * 
 * @param {string} text - Text to translate (English)
 * @param {string} targetLang - Target language code (e.g., 'hi', 'ta')
 * @param {string} sourceLang - Source language code (default: 'en')
 * @returns {Promise<Object>} Translation result with translatedText and cached flag
 * @throws {Error} If validation fails or translation API fails
 * 
 * @example
 * const result = await translateText('India is beautiful', 'hi');
 * // Returns: { translatedText: 'भारत सुंदर है', cached: false }
 */
async function translateText(text, targetLang, sourceLang = 'en') {
  // ==========================================================================
  // INPUT VALIDATION
  // ==========================================================================
  
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input: text must be a non-empty string');
  }
  
  const trimmedText = text.trim();
  if (!trimmedText) {
    return { translatedText: '', cached: false };
  }
  
  // Validate language codes
  if (!isLanguageSupported(targetLang)) {
    throw new Error(`Unsupported target language: ${targetLang}`);
  }
  if (!isLanguageSupported(sourceLang)) {
    throw new Error(`Unsupported source language: ${sourceLang}`);
  }
  
  // If source and target are the same, return original text
  if (sourceLang === targetLang) {
    return { translatedText: trimmedText, cached: false };
  }
  
  // ==========================================================================
  // CHECK CACHE
  // ==========================================================================
  
  const cacheKey = getCacheKey(trimmedText, sourceLang, targetLang);
  const cachedTranslation = getFromCache(cacheKey);
  
  if (cachedTranslation) {
    console.log(`[TranslationService] Cache hit for ${sourceLang} -> ${targetLang}`);
    return { translatedText: cachedTranslation, cached: true };
  }
  
  // ==========================================================================
  // CALL TRANSLATION API
  // ==========================================================================
  
  console.log(`[TranslationService] Translating: ${sourceLang} -> ${targetLang}`);
  
  // Call Hugging Face API with appropriate model
  const translatedText = await callHuggingFaceAPI(trimmedText, sourceLang, targetLang);
  
  // Clean up the response (remove any leading/trailing whitespace)
  const cleanedTranslation = translatedText.trim();
  
  // ==========================================================================
  // CACHE RESULT AND RETURN
  // ==========================================================================
  
  setInCache(cacheKey, cleanedTranslation);
  console.log(`[TranslationService] Translation successful, cached`);
  
  return { translatedText: cleanedTranslation, cached: false };
}

/**
 * Translate multiple texts in batch
 * 
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (default: 'en')
 * @returns {Promise<Object>} Object with translations array and cache hit count
 */
async function translateBatch(texts, targetLang, sourceLang = 'en') {
  if (!Array.isArray(texts) || texts.length === 0) {
    return { translations: [], cachedCount: 0 };
  }
  
  const results = [];
  let cachedCount = 0;
  
  // Process each text sequentially to avoid rate limiting
  for (const text of texts) {
    try {
      const result = await translateText(text, targetLang, sourceLang);
      results.push(result.translatedText);
      if (result.cached) cachedCount++;
    } catch (error) {
      console.error(`[TranslationService] Batch translation error: ${error.message}`);
      // On error, keep original text (fallback)
      results.push(text);
    }
  }
  
  return { translations: results, cachedCount };
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  translateText,
  translateBatch,
  getCacheStats,
  clearCache,
};
