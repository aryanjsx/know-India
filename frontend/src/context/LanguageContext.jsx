/**
 * Language Context for Know India
 * 
 * Provides language state management across the application
 * Stores selected language in localStorage for persistence
 * 
 * @module context/LanguageContext
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_CONFIG, getApiUrl } from '../config';

// Supported languages with display names
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

// Default language
const DEFAULT_LANGUAGE = 'en';
const STORAGE_KEY = 'knowindia_language';

// Create context
const LanguageContext = createContext(null);

/**
 * Language Provider Component
 * Wraps the app and provides language state
 */
export function LanguageProvider({ children }) {
  // Initialize from localStorage or default
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
  
  // Translation cache (in-memory, per session)
  const [translationCache, setTranslationCache] = useState({});
  
  /**
   * Set language and persist to localStorage
   */
  const setLanguage = useCallback((newLang) => {
    if (!LANGUAGES[newLang]) {
      console.warn(`Unsupported language: ${newLang}`);
      return;
    }
    
    setLanguageState(newLang);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLang);
    }
  }, []);
  
  /**
   * Translate text using backend API
   * @param {string} text - Text to translate
   * @param {string} targetLang - Target language (defaults to current language)
   * @returns {Promise<string>} Translated text
   */
  const translate = useCallback(async (text, targetLang = language) => {
    // Don't translate if target is English or same as source
    if (targetLang === 'en' || !text || text.trim() === '') {
      return text;
    }
    
    // Check cache first
    const cacheKey = `${text}:${targetLang}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }
    
    try {
      setIsTranslating(true);
      
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
      
      if (!response.ok) {
        throw new Error('Translation failed');
      }
      
      const data = await response.json();
      const translatedText = data.translatedText || text;
      
      // Update cache
      setTranslationCache(prev => ({
        ...prev,
        [cacheKey]: translatedText,
      }));
      
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      // Return original text on error
      return text;
    } finally {
      setIsTranslating(false);
    }
  }, [language, translationCache]);
  
  /**
   * Translate multiple texts at once
   * @param {string[]} texts - Array of texts to translate
   * @returns {Promise<string[]>} Array of translated texts
   */
  const translateBatch = useCallback(async (texts) => {
    if (language === 'en' || !texts || texts.length === 0) {
      return texts;
    }
    
    // Separate cached and uncached texts
    const results = new Array(texts.length);
    const uncachedIndices = [];
    const uncachedTexts = [];
    
    texts.forEach((text, index) => {
      const cacheKey = `${text}:${language}`;
      if (translationCache[cacheKey]) {
        results[index] = translationCache[cacheKey];
      } else {
        uncachedIndices.push(index);
        uncachedTexts.push(text);
      }
    });
    
    // If all are cached, return immediately
    if (uncachedTexts.length === 0) {
      return results;
    }
    
    try {
      setIsTranslating(true);
      
      const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.TRANSLATE}/batch`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts: uncachedTexts,
          targetLang: language,
          sourceLang: 'en',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Batch translation failed');
      }
      
      const data = await response.json();
      const translations = data.translations || uncachedTexts;
      
      // Update results and cache
      const newCacheEntries = {};
      uncachedIndices.forEach((originalIndex, i) => {
        results[originalIndex] = translations[i];
        newCacheEntries[`${uncachedTexts[i]}:${language}`] = translations[i];
      });
      
      setTranslationCache(prev => ({
        ...prev,
        ...newCacheEntries,
      }));
      
      return results;
    } catch (error) {
      console.error('Batch translation error:', error);
      // Fill in original texts for uncached items on error
      uncachedIndices.forEach((originalIndex, i) => {
        results[originalIndex] = uncachedTexts[i];
      });
      return results;
    } finally {
      setIsTranslating(false);
    }
  }, [language, translationCache]);
  
  /**
   * Clear translation cache
   */
  const clearCache = useCallback(() => {
    setTranslationCache({});
  }, []);
  
  // Clear cache when language changes
  useEffect(() => {
    // Keep cache entries, they'll be useful if user switches back
    // Only clear if memory usage becomes a concern
  }, [language]);
  
  const value = {
    language,
    setLanguage,
    languages: LANGUAGES,
    currentLanguage: LANGUAGES[language],
    isTranslating,
    translate,
    translateBatch,
    clearCache,
    isEnglish: language === 'en',
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to use language context
 * @returns {LanguageContextValue} Language context value
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}

export default LanguageContext;
