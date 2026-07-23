import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

const InvestigationLeads = ({ leads }) => {
  if (!leads || leads.length === 0) return null;

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#3b82f6';
      default: return '#94a3b8';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return <AlertTriangle size={16} />;
      case 'MEDIUM': return <AlertCircle size={16} />;
      default: return <Info size={16} />;
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '12px' }}>Investigation Leads</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {leads.map((lead, i) => {
          const color = getPriorityColor(lead.priority);
          return (
            <div key={i} className="glass-panel" style={{ padding: '16px', borderLeft: `4px solid ${color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: color, fontWeight: 'bold', fontSize: '14px' }}>
                  {getPriorityIcon(lead.priority)}
                  {lead.lead_type}
                </div>
                {lead.confidence && (
                  <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                    Conf: {(lead.confidence * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-primary)' }}>
                <strong>Reasoning:</strong> {lead.reasoning}
              </p>
              {lead.evidence && (
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <strong>Evidence:</strong> {lead.evidence}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InvestigationLeads;
