import React from 'react';
import { FileText, MapPin, Calendar, User, Users, Target, Database } from 'lucide-react';

const FIRSummaryPanel = ({ bundle }) => {
  if (!bundle) return null;
  const fir = bundle.firSummary || {};

  const stats = [
    { label: 'Victims', value: fir.victimsCount ?? (bundle.victims?.length || 0), icon: Users, color: '#ef4444' },
    { label: 'Suspects', value: fir.suspectsCount ?? (bundle.suspects?.length || 0), icon: Target, color: '#f97316' },
    { label: 'Evidence', value: fir.evidenceCount ?? (bundle.evidence?.length || 0), icon: Database, color: '#8b5cf6' },
    { label: 'Witnesses', value: bundle.witnesses?.length || 0, icon: Users, color: '#3b82f6' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '16px', borderLeft: '4px solid var(--accent-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <FileText size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)', fontWeight: '700' }}>FIR Summary</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '700' }}>Crime Type</span>
          <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600' }}>{fir.crime || bundle.category || '—'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={10} />Date</span>
          <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600' }}>{fir.date || bundle.date || '—'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={10} />Police Station</span>
          <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600' }}>{fir.policeStation || bundle.policeStation || '—'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}><User size={10} />Officer</span>
          <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600' }}>{fir.officer || bundle.officer || '—'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `${color}15`, border: `1px solid ${color}30`, borderRadius: '8px', padding: '8px 14px' }}>
            <Icon size={14} color={color} />
            <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '700' }}>{value}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FIRSummaryPanel;
