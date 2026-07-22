import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = ({ style = {} }) => {
  const { language, switchLanguage } = useLanguage();

  return (
    <div 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        background: 'var(--bg-tertiary)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '20px', 
        padding: '3px',
        gap: '2px',
        ...style 
      }}
      role="group"
      aria-label="Language Selector"
    >
      <div style={{ paddingLeft: '8px', paddingRight: '4px', display: 'flex', alignItems: 'center' }}>
        <Globe size={14} color="var(--accent-primary)" />
      </div>

      <button
        type="button"
        onClick={() => switchLanguage('en')}
        aria-pressed={language === 'en'}
        style={{
          padding: '4px 10px',
          borderRadius: '16px',
          border: 'none',
          background: language === 'en' ? 'var(--accent-primary)' : 'transparent',
          color: language === 'en' ? '#ffffff' : 'var(--text-secondary)',
          fontSize: '12px',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => switchLanguage('kn')}
        aria-pressed={language === 'kn'}
        style={{
          padding: '4px 10px',
          borderRadius: '16px',
          border: 'none',
          background: language === 'kn' ? 'var(--accent-primary)' : 'transparent',
          color: language === 'kn' ? '#ffffff' : 'var(--text-secondary)',
          fontSize: '12px',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        ಕನ್ನಡ
      </button>
    </div>
  );
};

export default LanguageSwitcher;
