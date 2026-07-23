import React from 'react';
import { Clock } from 'lucide-react';

const TimelineView = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="glass-panel" style={{ marginTop: '20px', padding: '20px' }}>
      <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={18} color="var(--accent-primary)" />
        Chronological Timeline
      </h3>
      <div style={{ position: 'relative', borderLeft: '2px solid var(--glass-border)', marginLeft: '12px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {timeline.map((event, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <div style={{ 
              position: 'absolute', left: '-27px', top: '4px', 
              width: '12px', height: '12px', borderRadius: '50%', 
              background: 'var(--accent-primary)', border: '2px solid var(--bg-primary)' 
            }} />
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
              {event.event_time}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '4px 0' }}>
              {event.title}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {event.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineView;
