import React from 'react';
import { Sparkles, CheckCircle, HelpCircle } from 'lucide-react';

const AIExplanationPanel = ({ entity }) => {
  if (!entity) return (
    <div className="glass-panel" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
      <HelpCircle size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
      <p style={{ textAlign: 'center', margin: 0 }}>Select an extracted entity to view its AI reasoning.</p>
    </div>
  );

  return (
    <div className="glass-panel" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={18} color="#8b5cf6" />
        AI Explanation
      </h3>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>Selected Entity</div>
          <div style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{entity.entity_value} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>({entity.entity_type})</span></div>
        </div>

        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>Why was this extracted?</div>
          <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
            {entity.reasoning || 'No specific reasoning provided.'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>Originating Sentence</div>
          <div style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--accent-primary)', background: 'rgba(59,130,246,0.05)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--accent-primary)' }}>
            "{entity.extracted_from || 'N/A'}"
          </div>
        </div>

        {entity.confidence && (
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Confidence Score:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 'bold', color: entity.confidence > 0.8 ? '#10b981' : '#f59e0b' }}>
              <CheckCircle size={14} />
              {(entity.confidence * 100).toFixed(0)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIExplanationPanel;
