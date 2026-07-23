import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, Search, FolderSearch, LogOut, Languages, Loader } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import useAuth from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import * as conversationService from '../services/conversationService';
import TranslationStatus from '../services/TranslationStatus';

const Navbar = () => {
  const { officer } = useAppContext();
  const { user, logout } = useAuth();
  const { t, language, isEnglish } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [cases, setCases] = useState([]);
  const [translating, setTranslating] = useState(false);
  const [translateCount, setTranslateCount] = useState(0);

  // Subscribe to translation progress from AutoTranslator
  useEffect(() => {
    const unsub = TranslationStatus.subscribe(({ translating, count }) => {
      setTranslating(translating);
      setTranslateCount(count);
    });
    return unsub;
  }, []);

<<<<<<< Updated upstream
  const displayName = user?.name || officer.name;
  const displayRole = user?.email || officer.role;
  
  // Extract current caseId from URL (e.g. /investigate/2 or /timeline/2)
  const match = location.pathname.match(/\/(?:investigate|timeline)\/([^/]+)/);
  const currentCaseId = match ? match[1] : '1';

  useEffect(() => {
    conversationService.listCases()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setCases(res);
        } else {
          setCases([
            { id: '1', title: 'Case #1 — Cyber Heist' },
            { id: '2', title: 'Case #2 — Sector 18 Homicide' },
            { id: '3', title: 'Case #3 — Financial Fraud Syndicate' }
          ]);
        }
      })
      .catch(() => {
        setCases([
          { id: '1', title: 'Case #1 — Cyber Heist' },
          { id: '2', title: 'Case #2 — Sector 18 Homicide' },
          { id: '3', title: 'Case #3 — Financial Fraud Syndicate' }
        ]);
      });
  }, []);

  const handleCaseSelect = (e) => {
    const selectedId = e.target.value;
    if (selectedId) {
      navigate(`/investigate/${selectedId}`);
=======
  const displayName = user?.name || officer?.name || 'Unknown User';
  const displayRole = user?.role || officer?.role || 'Viewer';

  const getRoleColor = (role) => {
    switch(role) {
      case 'Administrator': return '#ef4444'; // Red
      case 'Investigator': return '#3b82f6'; // Blue
      case 'Analyst': return '#a855f7'; // Purple
      case 'Supervisor': return '#f97316'; // Orange
      case 'Policymaker': return '#10b981'; // Green
      default: return '#64748b'; // Gray
>>>>>>> Stashed changes
    }
  };

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '20px',
      padding: '16px 24px',
      borderRadius: '16px'
    }} className="glass-panel">
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Global Search */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '8px 16px', borderRadius: '8px', width: '280px' }}>
          <Search size={18} color="var(--text-muted)" style={{ marginRight: '8px', flexShrink: 0 }} />
          <input 
            type="text" 
            placeholder={t ? t('nav.searchPlaceholder') : 'Search cases, FIRs, entities...'}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '13px'
            }} 
          />
        </div>

        {/* Global Case Selector Option */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(37, 99, 235, 0.08)',
          padding: '6px 14px',
          borderRadius: '8px',
          border: '1px solid rgba(37, 99, 235, 0.25)'
        }}>
          <FolderSearch size={16} color="#2563EB" />
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t ? t('nav.activeCase') : 'Active Case'}:</span>
          <select
            value={currentCaseId}
            onChange={handleCaseSelect}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontWeight: '600',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {cases.map((c) => (
              <option key={c.id} value={String(c.id)} style={{ background: '#FFFFFF', color: '#111827' }}>
                {c.title || `Case #${c.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Live translation indicator — only visible when Zia NLP is active */}
        {!isEnglish && (
          <div
            title={translating ? `Translating ${translateCount} strings via Zia NLP...` : 'Page translated'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontWeight: '600',
              padding: '4px 10px',
              borderRadius: '20px',
              background: translating
                ? 'rgba(99, 102, 241, 0.12)'
                : 'rgba(16, 185, 129, 0.1)',
              border: translating
                ? '1px solid rgba(99, 102, 241, 0.3)'
                : '1px solid rgba(16, 185, 129, 0.25)',
              color: translating ? '#6366F1' : '#10B981',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {translating ? (
              <>
                <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} />
                <span>NLP...</span>
              </>
            ) : (
              <>
                <Languages size={11} />
                <span>ಅನುವಾದಿಸಲಾಗಿದೆ</span>
              </>
            )}
          </div>
        )}

        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={22} color="var(--text-secondary)" />
          <span style={{ 
            position: 'absolute', top: '-4px', right: '-4px', background: 'var(--accent-danger)', 
            width: '10px', height: '10px', borderRadius: '50%' 
          }}></span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--glass-border)', paddingLeft: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>{displayName}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginTop: '2px' }}>
              <span style={{ 
                background: getRoleColor(displayRole), 
                color: 'white', 
                fontSize: '10px', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                fontWeight: 'bold' 
              }}>
                {displayRole}
              </span>
            </div>
          </div>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center' 
          }}>
            <User size={20} color="white" />
          </div>
          
          <button 
            onClick={logout}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              marginLeft: '8px',
              color: 'var(--text-secondary)'
            }}
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
