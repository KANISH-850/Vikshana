import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import translations from '../translations/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('vikshana_lang') || 'en';
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
    if (lang === 'en' || lang === 'kn') {
      setLanguage(lang);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => (prev === 'en' ? 'kn' : 'en'));
  }, []);

  /**
   * Helper function to retrieve nested translation strings by path.
   * Example: t('nav.dashboard') -> "Dashboard" or "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್"
   */
  const t = useCallback((path, fallback = '') => {
    if (!path) return fallback;
    const keys = path.split('.');
    let result = translations[language];

    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
        // Fallback to English if key missing in Kannada
        let enResult = translations.en;
        for (const k of keys) {
          if (enResult && enResult[k] !== undefined) enResult = enResult[k];
          else return fallback || path;
        }
        return enResult || fallback || path;
      }
    }

    return typeof result === 'string' ? result : (fallback || path);
  }, [language]);

  const value = {
    language,
    isKannada: language === 'kn',
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
