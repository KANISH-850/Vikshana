import React from 'react';
import { Bell, User, Search, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import useAuth from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { officer } = useAppContext();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const displayName = user?.name || officer.name;
  const displayRole = user?.email || officer.role;

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '20px',
      padding: '16px 24px',
      borderRadius: '16px'
    }} className="glass-panel">
      
      {/* Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '8px 16px', borderRadius: '8px', width: '320px' }}>
        <Search size={18} color="var(--text-muted)" style={{ marginRight: '8px', flexShrink: 0 }} />
        <input 
          type="text" 
          placeholder={t('nav.searchPlaceholder')}
          style={{ 
            background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '13px'
          }} 
        />
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Language Switcher */}
        <LanguageSwitcher />

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
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{displayRole}</div>
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
