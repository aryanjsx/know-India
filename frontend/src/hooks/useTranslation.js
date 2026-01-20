/**
 * Translation Hooks
 * 
 * Custom hooks for using translation in components.
 * These hooks simplify the integration of translations in pages.
 * 
 * @module hooks/useTranslation
 */

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Hook for translating a single piece of text
 * 
 * Automatically re-translates when language changes.
 * Returns original text while translating, then updates with translation.
 * 
 * @param {string} text - Text to translate (English)
 * @param {Object} options - Options
 * @param {boolean} options.enabled - Whether translation is enabled (default: true)
 * @returns {Object} { translatedText, isLoading }
 * 
 * @example
 * function MyComponent() {
 *   const { translatedText, isLoading } = useTranslatedText('Hello India');
 *   return <h1>{translatedText}</h1>;
 * }
 */
export function useTranslatedText(text, { enabled = true } = {}) {
  const { language, translate, isEnglish } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Skip translation if disabled or English
    if (!enabled || isEnglish || !text) {
      setTranslatedText(text);
      return;
    }
    
    let cancelled = false;
    setIsLoading(true);
    
    translate(text, language)
      .then(result => {
        if (!cancelled) {
          setTranslatedText(result);
        }
      })
      .catch(error => {
        console.error('[useTranslatedText] Translation error:', error);
        if (!cancelled) {
          setTranslatedText(text); // Fallback to original
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, [text, language, translate, isEnglish, enabled]);
  
  return { translatedText, isLoading };
}

/**
 * Hook for translating multiple texts at once
 * 
 * Useful for pages with multiple translatable sections.
 * Uses batch translation for efficiency.
 * 
 * @param {Object} textsMap - Object with keys and English text values
 * @returns {Object} { translations, isLoading }
 * 
 * @example
 * function MyPage() {
 *   const { translations, isLoading } = useTranslatedTexts({
 *     title: 'Welcome to India',
 *     description: 'Explore our heritage',
 *   });
 *   return (
 *     <>
 *       <h1>{translations.title}</h1>
 *       <p>{translations.description}</p>
 *     </>
 *   );
 * }
 */
export function useTranslatedTexts(textsMap) {
  const { language, translateBatch, isEnglish } = useLanguage();
  const [translations, setTranslations] = useState(textsMap);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Skip if English
    if (isEnglish || !textsMap) {
      setTranslations(textsMap);
      return;
    }
    
    let cancelled = false;
    setIsLoading(true);
    
    const keys = Object.keys(textsMap);
    const texts = Object.values(textsMap);
    
    translateBatch(texts, language)
      .then(translatedTexts => {
        if (!cancelled) {
          const result = {};
          keys.forEach((key, index) => {
            result[key] = translatedTexts[index];
          });
          setTranslations(result);
        }
      })
      .catch(error => {
        console.error('[useTranslatedTexts] Translation error:', error);
        if (!cancelled) {
          setTranslations(textsMap); // Fallback to original
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, [textsMap, language, translateBatch, isEnglish]);
  
  return { translations, isLoading };
}

/**
 * Hook for manual translation control
 * 
 * Gives full control over when to translate.
 * Useful for dynamic content that changes frequently.
 * 
 * @returns {Object} { translate, translateBatch, language, isTranslating, isEnglish }
 * 
 * @example
 * function DynamicContent({ content }) {
 *   const { translate, language, isEnglish } = useManualTranslation();
 *   const [displayText, setDisplayText] = useState(content);
 *   
 *   useEffect(() => {
 *     if (!isEnglish) {
 *       translate(content).then(setDisplayText);
 *     } else {
 *       setDisplayText(content);
 *     }
 *   }, [content, language]);
 *   
 *   return <p>{displayText}</p>;
 * }
 */
export function useManualTranslation() {
  const { language, translate, translateBatch, isTranslating, isEnglish } = useLanguage();
  
  return {
    translate,
    translateBatch,
    language,
    isTranslating,
    isEnglish,
  };
}

// Re-export the main context hook for convenience
export { useLanguage } from '../context/LanguageContext';
