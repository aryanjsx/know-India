/**
 * Language Code Mapping for IndicTrans2 Model
 * 
 * Maps simple language codes to IndicTrans2 format codes
 * Format: {script}_{ISO} where script is the writing system
 * 
 * @see https://huggingface.co/ai4bharat/indictrans2-indic-indic-1B
 */

const LANGUAGE_CODES = {
  // Indo-European Languages
  en: 'eng_Latn',    // English - Latin script
  hi: 'hin_Deva',    // Hindi - Devanagari script
  mr: 'mar_Deva',    // Marathi - Devanagari script
  ne: 'nep_Deva',    // Nepali - Devanagari script
  sa: 'san_Deva',    // Sanskrit - Devanagari script
  
  // Bengali-Assamese group
  bn: 'ben_Beng',    // Bengali - Bengali script
  as: 'asm_Beng',    // Assamese - Bengali script (same script as Bengali)
  
  // Dravidian Languages
  ta: 'tam_Taml',    // Tamil - Tamil script
  te: 'tel_Telu',    // Telugu - Telugu script
  kn: 'kan_Knda',    // Kannada - Kannada script
  ml: 'mal_Mlym',    // Malayalam - Malayalam script
  
  // Other Indo-Aryan Languages
  gu: 'guj_Gujr',    // Gujarati - Gujarati script
  pa: 'pan_Guru',    // Punjabi - Gurmukhi script
  or: 'ory_Orya',    // Odia/Oriya - Odia script
  ur: 'urd_Arab',    // Urdu - Arabic script
};

// Human-readable language names for UI
const LANGUAGE_NAMES = {
  en: 'English',
  hi: 'हिन्दी (Hindi)',
  ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)',
  bn: 'বাংলা (Bengali)',
  mr: 'मराठी (Marathi)',
  gu: 'ગુજરાતી (Gujarati)',
  kn: 'ಕನ್ನಡ (Kannada)',
  ml: 'മലയാളം (Malayalam)',
  pa: 'ਪੰਜਾਬੀ (Punjabi)',
  or: 'ଓଡ଼ିଆ (Odia)',
  as: 'অসমীয়া (Assamese)',
  ur: 'اردو (Urdu)',
  ne: 'नेपाली (Nepali)',
  sa: 'संस्कृतम् (Sanskrit)',
};

// Supported source languages (for validation)
const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_CODES);

/**
 * Get IndicTrans2 language code from simple code
 * @param {string} langCode - Simple language code (e.g., 'hi', 'ta')
 * @returns {string|null} IndicTrans2 code or null if not supported
 */
function getIndicTransCode(langCode) {
  return LANGUAGE_CODES[langCode] || null;
}

/**
 * Check if a language code is supported
 * @param {string} langCode - Language code to check
 * @returns {boolean} True if supported
 */
function isLanguageSupported(langCode) {
  return SUPPORTED_LANGUAGES.includes(langCode);
}

/**
 * Get human-readable language name
 * @param {string} langCode - Language code
 * @returns {string} Human-readable name
 */
function getLanguageName(langCode) {
  return LANGUAGE_NAMES[langCode] || langCode;
}

module.exports = {
  LANGUAGE_CODES,
  LANGUAGE_NAMES,
  SUPPORTED_LANGUAGES,
  getIndicTransCode,
  isLanguageSupported,
  getLanguageName,
};
