import React from 'react';
import { Database, Percent, ShieldCheck, Tag } from 'lucide-react';

const EvidenceSummaryCards = ({ summary }) => {
  if (!summary) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <Database size={16} /> <span style={{ fontSize: '13px', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Evidence</span>
        </div>
        <div style={{ fontSize: '28px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{summary.totalCount}</div>
      </div>
      
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <Tag size={16} /> <span style={{ fontSize: '13px', textTransform: 'uppercase', fontWeight: 'bold' }}>Categories</span>
        </div>
        <div style={{ fontSize: '28px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{summary.typesCount}</div>
      </div>

      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <Percent size={16} /> <span style={{ fontSize: '13px', textTransform: 'uppercase', fontWeight: 'bold' }}>Completeness</span>
        </div>
        <div style={{ fontSize: '28px', color: summary.completeness > 75 ? '#10b981' : (summary.completeness > 40 ? '#f59e0b' : '#ef4444'), fontWeight: 'bold' }}>
          {summary.completeness}%
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <ShieldCheck size={16} /> <span style={{ fontSize: '13px', textTransform: 'uppercase', fontWeight: 'bold' }}>Quality</span>
        </div>
        <div style={{ fontSize: '28px', color: summary.quality === 'High' ? '#10b981' : (summary.quality === 'Medium' ? '#f59e0b' : '#ef4444'), fontWeight: 'bold' }}>
          {summary.quality}
        </div>
      </div>
    </div>
  );
};

export default EvidenceSummaryCards;
