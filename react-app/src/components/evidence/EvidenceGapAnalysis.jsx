import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

const EvidenceGapAnalysis = ({ gaps }) => {
  if (!gaps || gaps.length === 0) return (
    <div className="glass-panel" style={{ padding: '20px', color: 'var(--text-secondary)' }}>
      No evidence gaps detected.
    </div>
  );

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#3b82f6';
      default: return '#94a3b8';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH': return <AlertTriangle size={16} />;
      case 'MEDIUM': return <AlertCircle size={16} />;
      default: return <Info size={16} />;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertTriangle size={18} color="#ef4444" />
        Investigation Gap Analysis
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {gaps.map((gap, i) => {
          const color = getPriorityColor(gap.priority);
          return (
            <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${color}`, borderRadius: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color, fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                {getPriorityIcon(gap.priority)}
                {gap.missing_item}
                <span style={{ fontSize: '10px', padding: '2px 6px', background: `${color}20`, borderRadius: '12px', marginLeft: 'auto' }}>
                  {gap.priority}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {gap.reasoning}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EvidenceGapAnalysis;
