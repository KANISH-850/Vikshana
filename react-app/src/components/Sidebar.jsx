import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, Search, Network, Clock, FileText, Settings, ShieldAlert } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Investigation Workspace', icon: Search, path: '/investigate' },
    { name: 'Crime Intelligence', icon: ShieldAlert, path: '/intelligence' },
    { name: 'Relationship Explorer', icon: Network, path: '/relationships' },
    { name: 'Case Timeline', icon: Clock, path: '/timeline' },
    { name: 'Evidence Ledger', icon: Shield, path: '/evidence' },
    { name: 'Reports', icon: FileText, path: '/reports' },
  ];

  return (
    <aside className="glass-panel" style={{ width: '260px', height: 'calc(100vh - 40px)', margin: '20px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', color: 'var(--accent-primary)' }}>
        <Shield size={32} />
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', letterSpacing: '1px' }}>VIKSHANA</h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              borderLeft: isActive ? '4px solid var(--accent-primary)' : '4px solid transparent',
              transition: 'all 0.2s ease',
              fontWeight: isActive ? '600' : '400'
            })}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
        <NavLink
          to="/settings"
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
            color: 'var(--text-secondary)', textDecoration: 'none'
          }}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
