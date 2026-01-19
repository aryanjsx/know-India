/**
 * useTranslation Hook
 * 
 * Custom hook for translating content in components
 * Provides easy-to-use translation utilities
 * 
 * @module hooks/useTranslation
 */

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Hook for translating a single text value
 * 
 * @param {string} text - Original text (English)
 * @returns {{translated: string, isLoading: boolean, error: Error|null}}
 * 
 * @example
 * const { translated, isLoading } = useTranslatedText('Welcome to India');
 * return <h1>{isLoading ? text : translated}</h1>;
 */
export function useTranslatedText(text) {
  const { translate, language, isEnglish } = useLanguage();
  const [translated, setTranslated] = useState(text);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    
    // Reset to original for English
    if (isEnglish || !text) {
      setTranslated(text);
      return;
    }
    
    async function doTranslate() {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await translate(text);
        if (isMounted) {
          setTranslated(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setTranslated(text); // Fallback to original
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    doTranslate();
    
    return () => {
      isMounted = false;
    };
  }, [text, language, translate, isEnglish]);
  
  return { translated, isLoading, error };
}

/**
 * Hook for translating multiple texts
 * 
 * @param {string[]} texts - Array of original texts
 * @returns {{translations: string[], isLoading: boolean}}
 * 
 * @example
 * const { translations, isLoading } = useTranslatedBatch(['Hello', 'World']);
 */
export function useTranslatedBatch(texts) {
  const { translateBatch, language, isEnglish } = useLanguage();
  const [translations, setTranslations] = useState(texts);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    
    if (isEnglish || !texts || texts.length === 0) {
      setTranslations(texts);
      return;
    }
    
    async function doTranslate() {
      setIsLoading(true);
      
      try {
        const results = await translateBatch(texts);
        if (isMounted) {
          setTranslations(results);
        }
      } catch (err) {
        if (isMounted) {
          setTranslations(texts); // Fallback to originals
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    doTranslate();
    
    return () => {
      isMounted = false;
    };
  }, [texts, language, translateBatch, isEnglish]);
  
  return { translations, isLoading };
}

/**
 * Hook for on-demand translation (manual trigger)
 * 
 * @returns {{translate: Function, isLoading: boolean}}
 * 
 * @example
 * const { translate, isLoading } = useManualTranslation();
 * const handleClick = async () => {
 *   const translated = await translate('Hello World');
 *   console.log(translated);
 * };
 */
export function useManualTranslation() {
  const { translate: contextTranslate, isTranslating } = useLanguage();
  
  const translate = useCallback(async (text, targetLang) => {
    return contextTranslate(text, targetLang);
  }, [contextTranslate]);
  
  return { translate, isLoading: isTranslating };
}

/**
 * Hook that provides translation state and utilities
 * Comprehensive hook for complex translation needs
 * 
 * @returns {Object} Translation utilities and state
 */
export function useTranslation() {
  const languageContext = useLanguage();
  
  return {
    // Current language
    language: languageContext.language,
    currentLanguage: languageContext.currentLanguage,
    isEnglish: languageContext.isEnglish,
    
    // Change language
    setLanguage: languageContext.setLanguage,
    languages: languageContext.languages,
    
    // Translation functions
    translate: languageContext.translate,
    translateBatch: languageContext.translateBatch,
    
    // Loading state
    isTranslating: languageContext.isTranslating,
    
    // Cache management
    clearCache: languageContext.clearCache,
  };
}

export default useTranslation;
