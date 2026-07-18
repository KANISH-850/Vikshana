import React from 'react';
import { motion } from 'framer-motion';

const DashboardCard = ({ title, value, subtitle, icon: Icon, color = 'var(--accent-primary)' }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
      className="glass-panel"
      style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>{title}</h3>
        <div style={{ background: `${color}20`, padding: '8px', borderRadius: '8px' }}>
          <Icon size={20} color={color} />
        </div>
      </div>
      
      <div>
        <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)' }}>{value}</h2>
        {subtitle && (
          <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: subtitle.startsWith('+') ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default DashboardCard;
