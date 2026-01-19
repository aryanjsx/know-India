/**
 * Translation Service for Know India
 * 
 * Uses Hugging Face Inference API with IndicTrans2 model
 * Includes in-memory caching to avoid duplicate API calls
 * 
 * @module services/translationService
 */

const { getIndicTransCode, isLanguageSupported } = require('../utils/languageCodes');

// Hugging Face API configuration
const HF_API_URL = 'https://api-inference.huggingface.co/models/ai4bharat/indictrans2-indic-indic-1B';

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
 * Call Hugging Face Inference API for translation
 * @param {string} inputText - Text formatted for IndicTrans2
 * @param {number} retries - Number of retries for 503 errors
 * @returns {Promise<string>} Translated text
 */
async function callHuggingFaceAPI(inputText, retries = 3) {
  const apiKey = process.env.HF_API_KEY;
  
  if (!apiKey) {
    throw new Error('Hugging Face API key not configured');
  }
  
  const response = await fetch(HF_API_URL, {
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
    // Get IndicTrans2 language code
    const targetCode = getIndicTransCode(targetLang);
    
    // Format input for IndicTrans2: "<2{target_code}> text"
    const formattedInput = `<2${targetCode}> ${trimmedText}`;
    
    console.log(`Translating: ${sourceLang} -> ${targetLang}`);
    
    // Call Hugging Face API
    const translatedText = await callHuggingFaceAPI(formattedInput);
    
    // Clean up the response (remove any prefix tags if present)
    const cleanedTranslation = translatedText
      .replace(/^<2[a-z_]+>\s*/i, '')
      .trim();
    
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
