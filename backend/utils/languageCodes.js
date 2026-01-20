/**
 * Language Code Mapping for IndicTrans2 Model
 * 
 * Maps simple ISO 639-1 language codes to IndicTrans2 format codes.
 * IndicTrans2 uses BCP-47 style codes with script information.
 * 
 * @module utils/languageCodes
 * @see https://huggingface.co/ai4bharat/indictrans2-indic-indic-1B
 */

/**
 * IndicTrans2 language codes mapping
 * Format: { simpleCode: 'indicTrans2Code' }
 */
const INDICTRANS2_CODES = {
  en: 'eng_Latn',    // English - Latin script
  hi: 'hin_Deva',    // Hindi - Devanagari script
  ta: 'tam_Taml',    // Tamil - Tamil script
  te: 'tel_Telu',    // Telugu - Telugu script
  bn: 'ben_Beng',    // Bengali - Bengali script
  mr: 'mar_Deva',    // Marathi - Devanagari script
  gu: 'guj_Gujr',    // Gujarati - Gujarati script
  kn: 'kan_Knda',    // Kannada - Kannada script
  ml: 'mal_Mlym',    // Malayalam - Malayalam script
  pa: 'pan_Guru',    // Punjabi - Gurmukhi script
  or: 'ory_Orya',    // Odia - Odia script
  as: 'asm_Beng',    // Assamese - Bengali script
  ur: 'urd_Arab',    // Urdu - Arabic script
  ne: 'nep_Deva',    // Nepali - Devanagari script
  sa: 'san_Deva',    // Sanskrit - Devanagari script
};

/**
 * Human-readable language names for UI display
 * Includes native script names for better UX
 */
const LANGUAGE_NAMES = {
  en: { name: 'English', nativeName: 'English' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்' },
  te: { name: 'Telugu', nativeName: 'తెలుగు' },
  bn: { name: 'Bengali', nativeName: 'বাংলা' },
  mr: { name: 'Marathi', nativeName: 'मराठी' },
  gu: { name: 'Gujarati', nativeName: 'ગુજરાતી' },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  ml: { name: 'Malayalam', nativeName: 'മലയാളം' },
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  or: { name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  as: { name: 'Assamese', nativeName: 'অসমীয়া' },
  ur: { name: 'Urdu', nativeName: 'اردو' },
  ne: { name: 'Nepali', nativeName: 'नेपाली' },
  sa: { name: 'Sanskrit', nativeName: 'संस्कृतम्' },
};

/**
 * List of all supported language codes
 */
const SUPPORTED_LANGUAGES = Object.keys(INDICTRANS2_CODES);

/**
 * Get IndicTrans2 language code from simple ISO code
 * 
 * @param {string} langCode - Simple language code (e.g., 'hi', 'ta')
 * @returns {string|null} IndicTrans2 code or null if not supported
 * 
 * @example
 * getIndicTransCode('hi') // Returns 'hin_Deva'
 * getIndicTransCode('xyz') // Returns null
 */
function getIndicTransCode(langCode) {
  if (!langCode || typeof langCode !== 'string') {
    return null;
  }
  return INDICTRANS2_CODES[langCode.toLowerCase()] || null;
}

/**
 * Check if a language code is supported
 * 
 * @param {string} langCode - Language code to check
 * @returns {boolean} True if language is supported
 * 
 * @example
 * isLanguageSupported('hi') // Returns true
 * isLanguageSupported('xyz') // Returns false
 */
function isLanguageSupported(langCode) {
  if (!langCode || typeof langCode !== 'string') {
    return false;
  }
  return SUPPORTED_LANGUAGES.includes(langCode.toLowerCase());
}

/**
 * Get human-readable language name
 * 
 * @param {string} langCode - Language code
 * @returns {Object} Object with name and nativeName, or default values
 * 
 * @example
 * getLanguageName('hi') // Returns { name: 'Hindi', nativeName: 'हिन्दी' }
 */
function getLanguageName(langCode) {
  if (!langCode || typeof langCode !== 'string') {
    return { name: 'Unknown', nativeName: 'Unknown' };
  }
  return LANGUAGE_NAMES[langCode.toLowerCase()] || { name: langCode, nativeName: langCode };
}

/**
 * Get all supported languages with their details
 * 
 * @returns {Array} Array of language objects with code, name, nativeName, and indicCode
 */
function getAllLanguages() {
  return SUPPORTED_LANGUAGES.map(code => ({
    code,
    ...LANGUAGE_NAMES[code],
    indicCode: INDICTRANS2_CODES[code],
  }));
}

module.exports = {
  INDICTRANS2_CODES,
  LANGUAGE_NAMES,
  SUPPORTED_LANGUAGES,
  getIndicTransCode,
  isLanguageSupported,
  getLanguageName,
  getAllLanguages,
};
