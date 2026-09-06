import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import translations from '../translations/translations';
import translationService, { clearTranslationCache } from '../services/translationService';

const LanguageContext = createContext();

/** All supported language codes and their display labels */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'EN',     nativeLabel: 'English' },
  { code: 'kn', label: 'ಕನ್ನಡ', nativeLabel: 'Kannada' },
  { code: 'hi', label: 'हिन्दी', nativeLabel: 'Hindi'   }
];

const VALID_CODES = SUPPORTED_LANGUAGES.map(l => l.code);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      const stored = localStorage.getItem('vikshana_lang');
      return VALID_CODES.includes(stored) ? stored : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('vikshana_lang', language);
      document.documentElement.lang = language;
    } catch (e) {
      console.warn('[LanguageContext] Failed to persist language choice:', e);
    }
  }, [language]);

  const switchLanguage = useCallback((lang) => {
    if (!VALID_CODES.includes(lang)) return;
    setLanguage(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => (prev === 'en' ? 'kn' : 'en'));
  }, []);

  /**
   * Helper function to retrieve nested translation strings by path or direct text string.
   * Example: t('nav.dashboard') -> "Dashboard" or "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್"
   *          t('Crime Forecasting') -> "ಅಪರಾಧ ಮುನ್ಸೂಚನೆ"
   */
  const t = useCallback((path, fallback = '') => {
    if (!path) return fallback;
    if (language === 'en') {
      const keys = path.split('.');
      let result = translations.en;
      for (const key of keys) {
        if (result && result[key] !== undefined) {
          result = result[key];
        } else {
          result = null;
          break;
        }
      }
      return typeof result === 'string' ? result : (fallback || path);
    }

    // Non-English language (kn, hi)
    const keys = path.split('.');
    const langDict = translations[language] || translations['en'];
    let result = langDict;

    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
        result = null;
        break;
      }
    }

    if (typeof result === 'string') return result;

    // Check direct dictionary / cached lookup via translationService
    const cachedDirect = translationService.getCached(path, language);
    if (cachedDirect && cachedDirect !== path) return cachedDirect;

    // Fallback to English dictionary for nested path
    let enResult = translations.en;
    for (const k of keys) {
      if (enResult && enResult[k] !== undefined) enResult = enResult[k];
      else { enResult = null; break; }
    }

    return typeof enResult === 'string' ? enResult : (fallback || path);
  }, [language]);

  const value = {
    language,
    isKannada: language === 'kn',
    isEnglish: language === 'en',
    supportedLanguages: SUPPORTED_LANGUAGES,
    switchLanguage,
    toggleLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;

