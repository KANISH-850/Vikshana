import React from 'react';
import { useAppContext } from '../context/AppContext';

const Settings = () => {
  const { theme, toggleTheme, officer } = useAppContext();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '28px', color: 'var(--text-primary)' }}>Settings</h1>
        <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>Configure your VIKSHANA experience.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Profile</h3>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Name: {officer.name}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Role: {officer.role}</div>
        </div>

        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Preferences</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Theme Mode</span>
            <button 
              onClick={toggleTheme}
              style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
            >
              Toggle to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
