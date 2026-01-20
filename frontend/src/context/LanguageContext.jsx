/**
 * Language Context for Know India
 * 
 * Provides language state management and translation functionality
 * across the application. Stores selected language in localStorage
 * for persistence between sessions.
 * 
 * IMPORTANT: Translations happen ONLY on the backend via /api/translate
 * 
 * @module context/LanguageContext
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { API_CONFIG, getApiUrl } from '../config';

// =============================================================================
// SUPPORTED LANGUAGES
// =============================================================================

/**
 * Supported languages with display information
 * Matches backend LANGUAGE_NAMES for consistency
 */
export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  ta: { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  te: { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  bn: { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  mr: { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  gu: { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  kn: { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  ml: { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  pa: { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  or: { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  as: { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  ur: { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  ne: { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  sa: { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
};

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_LANGUAGE = 'en';
const STORAGE_KEY = 'knowindia_language';

// =============================================================================
// CONTEXT
// =============================================================================

const LanguageContext = createContext(null);

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

/**
 * Language Provider Component
 * 
 * Wraps the application and provides:
 * - Current language state
 * - Language setter function
 * - Translation function (calls backend API)
 * - Translation loading state
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export function LanguageProvider({ children }) {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  
  // Initialize language from localStorage or use default
  const [language, setLanguageState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && LANGUAGES[stored]) {
        return stored;
      }
    }
    return DEFAULT_LANGUAGE;
  });
  
  // Loading state for translations
  const [isTranslating, setIsTranslating] = useState(false);
  
  // In-memory cache for translations (session-only)
  // This prevents duplicate API calls within the same session
  const translationCache = useRef(new Map());
  
  // ---------------------------------------------------------------------------
  // LANGUAGE SETTER
  // ---------------------------------------------------------------------------
  
  /**
   * Set the current language and persist to localStorage
   * 
   * @param {string} newLang - Language code (e.g., 'hi', 'ta')
   */
  const setLanguage = useCallback((newLang) => {
    // Validate language code
    if (!LANGUAGES[newLang]) {
      console.warn(`[LanguageContext] Unsupported language: ${newLang}`);
      return;
    }
    
    // Update state
    setLanguageState(newLang);
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLang);
    }
    
    console.log(`[LanguageContext] Language changed to: ${newLang}`);
  }, []);
  
  // ---------------------------------------------------------------------------
  // TRANSLATION FUNCTION
  // ---------------------------------------------------------------------------
  
  /**
   * Translate text to the current language via backend API
   * 
   * This function:
   * 1. Returns original text if target is English
   * 2. Checks local cache for existing translation
   * 3. Calls backend /api/translate endpoint
   * 4. Caches the result locally
   * 5. Falls back to original text on error
   * 
   * @param {string} text - Text to translate (assumed English)
   * @param {string} [targetLang] - Target language (defaults to current language)
   * @returns {Promise<string>} Translated text or original on error
   * 
   * @example
   * const translated = await translate('India is beautiful');
   * // Returns translated text in current language
   */
  const translate = useCallback(async (text, targetLang = language) => {
    // -------------------------------------------------------------------------
    // EARLY RETURNS
    // -------------------------------------------------------------------------
    
    // Don't translate empty text
    if (!text || typeof text !== 'string' || !text.trim()) {
      return text;
    }
    
    // Don't translate if target is English (source language)
    if (targetLang === 'en') {
      return text;
    }
    
    // -------------------------------------------------------------------------
    // CHECK LOCAL CACHE
    // -------------------------------------------------------------------------
    
    const cacheKey = `${text}:${targetLang}`;
    if (translationCache.current.has(cacheKey)) {
      return translationCache.current.get(cacheKey);
    }
    
    // -------------------------------------------------------------------------
    // CALL BACKEND API
    // -------------------------------------------------------------------------
    
    setIsTranslating(true);
    
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.TRANSLATE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLang,
          sourceLang: 'en',
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.translatedText) {
        // Cache the successful translation
        translationCache.current.set(cacheKey, data.translatedText);
        return data.translatedText;
      }
      
      // Log error but don't throw - return original text as fallback
      console.error('[LanguageContext] Translation API error:', data.error || 'Unknown error');
      return text;
      
    } catch (error) {
      // Network or other error - return original text as fallback
      console.error('[LanguageContext] Translation request failed:', error.message);
      return text;
      
    } finally {
      setIsTranslating(false);
    }
  }, [language]);
  
  // ---------------------------------------------------------------------------
  // BATCH TRANSLATION
  // ---------------------------------------------------------------------------
  
  /**
   * Translate multiple texts in a single batch request
   * 
   * @param {string[]} texts - Array of texts to translate
   * @param {string} [targetLang] - Target language (defaults to current language)
   * @returns {Promise<string[]>} Array of translated texts
   */
  const translateBatch = useCallback(async (texts, targetLang = language) => {
    // Don't translate if target is English
    if (targetLang === 'en' || !texts || texts.length === 0) {
      return texts;
    }
    
    // Check cache for all texts, identify which need translation
    const results = new Array(texts.length);
    const uncachedIndices = [];
    const uncachedTexts = [];
    
    texts.forEach((text, index) => {
      const cacheKey = `${text}:${targetLang}`;
      if (translationCache.current.has(cacheKey)) {
        results[index] = translationCache.current.get(cacheKey);
      } else {
        uncachedIndices.push(index);
        uncachedTexts.push(text);
      }
    });
    
    // If all texts are cached, return immediately
    if (uncachedTexts.length === 0) {
      return results;
    }
    
    // Call batch translation API
    setIsTranslating(true);
    
    try {
      const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.TRANSLATE}/batch`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts: uncachedTexts,
          targetLang,
          sourceLang: 'en',
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.translations) {
        // Cache and fill in results
        uncachedIndices.forEach((originalIndex, i) => {
          const translated = data.translations[i];
          results[originalIndex] = translated;
          translationCache.current.set(`${uncachedTexts[i]}:${targetLang}`, translated);
        });
        return results;
      }
      
      // On error, use original texts for uncached items
      console.error('[LanguageContext] Batch translation error:', data.error);
      uncachedIndices.forEach((originalIndex, i) => {
        results[originalIndex] = uncachedTexts[i];
      });
      return results;
      
    } catch (error) {
      console.error('[LanguageContext] Batch translation failed:', error.message);
      // Fill in original texts for uncached items
      uncachedIndices.forEach((originalIndex, i) => {
        results[originalIndex] = uncachedTexts[i];
      });
      return results;
      
    } finally {
      setIsTranslating(false);
    }
  }, [language]);
  
  // ---------------------------------------------------------------------------
  // CLEAR CACHE
  // ---------------------------------------------------------------------------
  
  /**
   * Clear the local translation cache
   * Useful when switching languages or clearing memory
   */
  const clearLocalCache = useCallback(() => {
    translationCache.current.clear();
    console.log('[LanguageContext] Local cache cleared');
  }, []);
  
  // ---------------------------------------------------------------------------
  // CONTEXT VALUE
  // ---------------------------------------------------------------------------
  
  const value = {
    // Current language code
    language,
    // Language setter function
    setLanguage,
    // Current language details
    currentLanguage: LANGUAGES[language],
    // All available languages
    languages: LANGUAGES,
    // Translation functions
    translate,
    translateBatch,
    // Loading state
    isTranslating,
    // Utility
    clearLocalCache,
    // Helper flags
    isEnglish: language === 'en',
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to access language context
 * 
 * @returns {Object} Language context value
 * @throws {Error} If used outside LanguageProvider
 * 
 * @example
 * const { language, setLanguage, translate } = useLanguage();
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}

export default LanguageContext;
