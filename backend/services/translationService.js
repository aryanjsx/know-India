/**
 * Translation Service for Know India
 * 
 * Uses Hugging Face Inference API with translation models
 * Includes in-memory caching to avoid duplicate API calls
 * 
 * @module services/translationService
 */

const { isLanguageSupported } = require('../utils/languageCodes');

// Hugging Face API base URL (using new router endpoint)
const HF_API_BASE = 'https://router.huggingface.co/hf-inference/models';

// Model mapping for different target languages
// Using Helsinki-NLP opus-mt models which are well-supported
const TRANSLATION_MODELS = {
  hi: 'Helsinki-NLP/opus-mt-en-hi',    // English to Hindi
  bn: 'Helsinki-NLP/opus-mt-en-bn',    // English to Bengali (limited)
  ta: 'Helsinki-NLP/opus-mt-en-ta',    // English to Tamil (limited)
  te: 'Helsinki-NLP/opus-mt-en-te',    // English to Telugu (limited)
  mr: 'Helsinki-NLP/opus-mt-en-mr',    // English to Marathi
  gu: 'Helsinki-NLP/opus-mt-en-gu',    // English to Gujarati
  ml: 'Helsinki-NLP/opus-mt-en-ml',    // English to Malayalam
  kn: 'Helsinki-NLP/opus-mt-en-kn',    // English to Kannada (limited)
  pa: 'Helsinki-NLP/opus-mt-en-pa',    // English to Punjabi (limited)
  ur: 'Helsinki-NLP/opus-mt-en-ur',    // English to Urdu
  // Fallback to multilingual model for languages without direct support
  default: 'facebook/nllb-200-distilled-600M'
};

// In-memory cache for translations
// Key format: `${sourceLang}:${targetLang}:${textHash}`
const translationCache = new Map();

// Cache settings
const CACHE_MAX_SIZE = 1000;        // Maximum number of cached translations
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Generate a simple hash for cache key
 * @param {string} text - Text to hash
 * @returns {string} Hash string
 */
function hashText(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Generate cache key for a translation request
 * @param {string} text - Source text
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @returns {string} Cache key
 */
function getCacheKey(text, sourceLang, targetLang) {
  return `${sourceLang}:${targetLang}:${hashText(text)}`;
}

/**
 * Get translation from cache
 * @param {string} key - Cache key
 * @returns {string|null} Cached translation or null
 */
function getFromCache(key) {
  const cached = translationCache.get(key);
  if (cached) {
    // Check if cache entry has expired
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.translation;
    }
    // Remove expired entry
    translationCache.delete(key);
  }
  return null;
}

/**
 * Store translation in cache
 * @param {string} key - Cache key
 * @param {string} translation - Translated text
 */
function setInCache(key, translation) {
  // Evict oldest entries if cache is full
  if (translationCache.size >= CACHE_MAX_SIZE) {
    const oldestKey = translationCache.keys().next().value;
    translationCache.delete(oldestKey);
  }
  
  translationCache.set(key, {
    translation,
    timestamp: Date.now(),
  });
}

/**
 * Get the appropriate model URL for the target language
 * @param {string} targetLang - Target language code
 * @returns {string} Full API URL for the model
 */
function getModelUrl(targetLang) {
  const model = TRANSLATION_MODELS[targetLang] || TRANSLATION_MODELS.default;
  return `${HF_API_BASE}/${model}`;
}

/**
 * Call Hugging Face Inference API for translation
 * @param {string} inputText - Text to translate
 * @param {string} targetLang - Target language code
 * @param {number} retries - Number of retries for 503 errors
 * @returns {Promise<string>} Translated text
 */
async function callHuggingFaceAPI(inputText, targetLang, retries = 3) {
  const apiKey = process.env.HF_API_KEY;
  
  if (!apiKey) {
    throw new Error('Hugging Face API key not configured');
  }
  
  const modelUrl = getModelUrl(targetLang);
  console.log(`Calling translation API: ${modelUrl}`);
  
  const response = await fetch(modelUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: inputText,
      options: {
        wait_for_model: true, // Wait if model is loading
      },
    }),
  });
  
  // Handle model loading (503 Service Unavailable)
  if (response.status === 503 && retries > 0) {
    const data = await response.json();
    const waitTime = data.estimated_time || 20;
    console.log(`Model loading, waiting ${waitTime}s... (${retries} retries left)`);
    
    // Wait for the estimated time
    await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
    
    // Retry the request
    return callHuggingFaceAPI(inputText, retries - 1);
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Hugging Face API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
  }
  
  const data = await response.json();
  
  // Handle different response formats
  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text;
  }
  if (data.generated_text) {
    return data.generated_text;
  }
  if (typeof data === 'string') {
    return data;
  }
  
  // For translation models, response might be in translation_text
  if (Array.isArray(data) && data[0]?.translation_text) {
    return data[0].translation_text;
  }
  
  throw new Error('Unexpected response format from Hugging Face API');
}

/**
 * Translate text to target language
 * 
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'hi', 'ta')
 * @param {string} sourceLang - Source language code (default: 'en')
 * @returns {Promise<{translatedText: string, cached: boolean}>} Translation result
 */
async function translateText(text, targetLang, sourceLang = 'en') {
  // Validate input
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input text');
  }
  
  // Trim and check for empty text
  const trimmedText = text.trim();
  if (!trimmedText) {
    return { translatedText: '', cached: false };
  }
  
  // If source and target are the same, return original text
  if (sourceLang === targetLang) {
    return { translatedText: trimmedText, cached: false };
  }
  
  // Validate language codes
  if (!isLanguageSupported(targetLang)) {
    throw new Error(`Unsupported target language: ${targetLang}`);
  }
  if (!isLanguageSupported(sourceLang)) {
    throw new Error(`Unsupported source language: ${sourceLang}`);
  }
  
  // Check cache first
  const cacheKey = getCacheKey(trimmedText, sourceLang, targetLang);
  const cachedTranslation = getFromCache(cacheKey);
  
  if (cachedTranslation) {
    console.log(`Cache hit for translation: ${sourceLang} -> ${targetLang}`);
    return { translatedText: cachedTranslation, cached: true };
  }
  
  try {
    console.log(`Translating: ${sourceLang} -> ${targetLang}`);
    
    // Call Hugging Face API with the text directly
    // Helsinki-NLP models accept plain text input
    const translatedText = await callHuggingFaceAPI(trimmedText, targetLang);
    
    // Clean up the response
    const cleanedTranslation = translatedText.trim();
    
    // Cache the result
    setInCache(cacheKey, cleanedTranslation);
    
    return { translatedText: cleanedTranslation, cached: false };
  } catch (error) {
    console.error('Translation error:', error.message);
    
    // Fallback: return original text with error flag
    throw error;
  }
}

/**
 * Translate multiple texts in batch
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code
 * @returns {Promise<{translations: string[], cached: number}>} Translated texts
 */
async function translateBatch(texts, targetLang, sourceLang = 'en') {
  const results = [];
  let cachedCount = 0;
  
  for (const text of texts) {
    try {
      const result = await translateText(text, targetLang, sourceLang);
      results.push(result.translatedText);
      if (result.cached) cachedCount++;
    } catch (error) {
      // On error, keep original text
      console.error(`Batch translation error for text: ${text.substring(0, 50)}...`);
      results.push(text);
    }
  }
  
  return { translations: results, cached: cachedCount };
}

/**
 * Get cache statistics
 * @returns {{size: number, maxSize: number}} Cache stats
 */
function getCacheStats() {
  return {
    size: translationCache.size,
    maxSize: CACHE_MAX_SIZE,
  };
}

/**
 * Clear translation cache
 */
function clearCache() {
  translationCache.clear();
  console.log('Translation cache cleared');
}

module.exports = {
  translateText,
  translateBatch,
  getCacheStats,
  clearCache,
};
