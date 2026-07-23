import React from 'react';
import { Sparkles, Info } from 'lucide-react';

const ExplanationPanel = ({ explanation }) => {
  if (!explanation) return null;

  // Attempt to parse out sections if formatted like "Reasoning: ... Filters Applied: ... Confidence: ..."
  let reasoning = explanation;
  let filters = '';
  let confidence = '';

  const reasoningMatch = explanation.match(/Reasoning:\s*(.*?)(?=Filters Applied:|Confidence:|$)/is);
  const filtersMatch = explanation.match(/Filters Applied:\s*(.*?)(?=Reasoning:|Confidence:|$)/is);
  const confidenceMatch = explanation.match(/Confidence:\s*(.*?)(?=Reasoning:|Filters Applied:|$)/is);

  if (reasoningMatch) reasoning = reasoningMatch[1].trim();
  if (filtersMatch) filters = filtersMatch[1].trim();
  if (confidenceMatch) confidence = confidenceMatch[1].trim();

  // Basic styling for confidence badge
  const confUpper = confidence.toUpperCase();
  let confColor = 'var(--text-secondary)';
  if (confUpper.includes('HIGH')) confColor = '#10b981'; // green
  if (confUpper.includes('MEDIUM')) confColor = '#f59e0b'; // amber
  if (confUpper.includes('LOW')) confColor = '#ef4444'; // red

  return (
    <div className="glass-panel" style={{ padding: '20px', marginTop: '20px', display: 'flex', gap: '16px' }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#8b5cf6'
        }}>
          <Sparkles size={20} />
        </div>
      </div>
      
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          AI Explanation
          {confidence && (
            <span style={{
              fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px',
              border: `1px solid ${confColor}40`, color: confColor, background: `${confColor}10`
            }}>
              CONFIDENCE: {confidence.toUpperCase()}
            </span>
          )}
        </h3>
        
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Reasoning:</strong> {reasoning || explanation}
          </div>
          {filters && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
              <Info size={16} color="var(--accent-primary)" style={{ marginTop: '3px', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Filters Applied:</strong> {filters}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplanationPanel;
