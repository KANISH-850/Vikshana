import React from 'react';
import { Clock, FileText, Lightbulb, AlertTriangle, GitCompare, Zap } from 'lucide-react';

const QUICK_ACTIONS = [
  {
    label: 'Generate Timeline',
    icon: Clock,
    color: '#3b82f6',
    prompt: 'Generate a complete chronological timeline of all events in this case based on all available evidence, witness statements, and phone records.'
  },
  {
    label: 'Investigation Report',
    icon: FileText,
    color: '#8b5cf6',
    command: '/report'
  },
  {
    label: 'Generate Leads',
    icon: Lightbulb,
    color: '#f59e0b',
    prompt: 'Analyze all evidence and identify the top 5 investigation leads for this case. Rank them by urgency and provide supporting evidence for each.'
  },
  {
    label: 'Arrest Recommendation',
    icon: Zap,
    color: '#ef4444',
    prompt: 'Based on all evidence, suspects, and witnesses in this case, generate a formal arrest recommendation. Include confidence score, supporting evidence IDs, and legal justification.'
  },
  {
    label: 'Missing Evidence',
    icon: AlertTriangle,
    color: '#f97316',
    prompt: 'Identify all missing evidence for this case. What evidence is critical but not yet collected? Rank each gap by severity: Critical, High, Medium, Low.'
  },
  {
    label: 'Compare Similar Cases',
    icon: GitCompare,
    color: '#10b981',
    prompt: 'Search the database for similar cases to this one. Look for matching crime type, location, weapon type, or suspect MO. List the similarities and suggest if they may be connected.'
  },
];

const QuickActionsBar = ({ onAction }) => {
  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.15)' }}>
      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '10px', letterSpacing: '0.05em' }}>
        Quick Actions
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {QUICK_ACTIONS.map((qa) => {
          const Icon = qa.icon;
          return (
            <button
              key={qa.label}
              onClick={() => onAction(qa)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '20px',
                background: `${qa.color}15`, border: `1px solid ${qa.color}30`,
                color: qa.color, fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.15s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `${qa.color}25`;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = `${qa.color}15`;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Icon size={12} />
              {qa.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsBar;
