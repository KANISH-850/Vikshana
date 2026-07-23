import React from 'react';
import { Clock } from 'lucide-react';

const EvidenceTimeline = ({ evidence }) => {
  if (!evidence || evidence.length === 0) return null;

  // Filter evidence that has a date and sort chronologically
  const timeline = evidence
    .filter(e => e.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (timeline.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={18} color="var(--accent-primary)" />
        Evidence Collection Timeline
      </h3>
      <div style={{ position: 'relative', borderLeft: '2px solid var(--glass-border)', marginLeft: '12px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {timeline.map((item, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <div style={{ 
              position: 'absolute', left: '-27px', top: '4px', 
              width: '12px', height: '12px', borderRadius: '50%', 
              background: 'var(--accent-primary)', border: '2px solid var(--bg-primary)' 
            }} />
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
              {new Date(item.date).toLocaleString()}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {item.title}
              <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'normal' }}>
                {item.type}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {item.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvidenceTimeline;
