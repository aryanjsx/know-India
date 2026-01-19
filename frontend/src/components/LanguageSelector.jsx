/**
 * Language Selector Component
 * 
 * Dropdown component for selecting the display language
 * Integrates with LanguageContext
 * 
 * @module components/LanguageSelector
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

/**
 * LanguageSelector - Dropdown for language selection
 * 
 * @param {Object} props
 * @param {string} props.variant - 'full' | 'compact' | 'icon' (default: 'full')
 * @param {string} props.className - Additional CSS classes
 */
function LanguageSelector({ variant = 'full', className = '' }) {
  const { language, setLanguage, currentLanguage, isTranslating } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Close on escape key
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);
  
  const handleSelect = (langCode) => {
    console.log('[LanguageSelector] Changing language to:', langCode);
    setLanguage(langCode);
    setIsOpen(false);
  };
  
  // Language list (sorted alphabetically by name)
  const languageList = Object.values(LANGUAGES).sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  // Render trigger button based on variant
  const renderTrigger = () => {
    if (variant === 'icon') {
      return (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-xl transition-all duration-200 ${
            isDark
              ? 'hover:bg-white/10 text-gray-300 hover:text-white'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          } ${isTranslating ? 'animate-pulse' : ''}`}
          aria-label="Select language"
          title={`Language: ${currentLanguage.name}`}
        >
          <Globe size={20} />
        </button>
      );
    }
    
    if (variant === 'compact') {
      return (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            isDark
              ? 'hover:bg-white/10 text-gray-300'
              : 'hover:bg-gray-100 text-gray-600'
          } ${isTranslating ? 'animate-pulse' : ''}`}
          aria-label="Select language"
        >
          <Globe size={16} />
          <span>{language.toUpperCase()}</span>
          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      );
    }
    
    // Full variant (default)
    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
          isDark
            ? 'bg-gray-800/50 hover:bg-gray-800 border-gray-700 text-gray-300'
            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-sm'
        } ${isTranslating ? 'animate-pulse' : ''}`}
        aria-label="Select language"
      >
        <Globe size={16} className={isDark ? 'text-orange-400' : 'text-orange-500'} />
        <span>{currentLanguage.nativeName}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    );
  };
  
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {renderTrigger()}
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto rounded-xl shadow-xl z-50 border ${
              isDark
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`px-3 py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Select Language
              </p>
            </div>
            
            {/* Language list */}
            <div className="py-1">
              {languageList.map((lang) => {
                const isSelected = lang.code === language;
                
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                      isSelected
                        ? isDark
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-orange-50 text-orange-700'
                        : isDark
                          ? 'text-gray-300 hover:bg-gray-700/50'
                          : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-base ${isSelected ? 'font-semibold' : ''}`}>
                        {lang.nativeName}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {lang.name}
                      </span>
                    </div>
                    
                    {isSelected && (
                      <Check size={16} className={isDark ? 'text-orange-400' : 'text-orange-600'} />
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Footer with note */}
            <div className={`px-3 py-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Translations powered by AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LanguageSelector;
