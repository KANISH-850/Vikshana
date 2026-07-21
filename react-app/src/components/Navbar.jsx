import React from 'react';
import { Bell, User, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  const { officer } = useAppContext();

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
      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '8px 16px', borderRadius: '8px', width: '300px' }}>
        <Search size={18} color="var(--text-muted)" style={{ marginRight: '8px' }} />
        <input 
          type="text" 
          placeholder="Search everywhere (Cases, FIRs, Entities)..." 
          style={{ 
            background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none'
          }} 
        />
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={24} color="var(--text-secondary)" />
          <span style={{ 
            position: 'absolute', top: '-4px', right: '-4px', background: 'var(--accent-danger)', 
            width: '10px', height: '10px', borderRadius: '50%' 
          }}></span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--glass-border)', paddingLeft: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>{officer.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{officer.role}</div>
          </div>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center' 
          }}>
            <User size={20} color="white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
