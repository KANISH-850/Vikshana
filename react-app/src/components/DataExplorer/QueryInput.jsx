import React, { useState } from 'react';
import { Send, Search, Loader2 } from 'lucide-react';

const QueryInput = ({ onExecute, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onExecute(query.trim());
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Search size={20} color="var(--accent-primary)" />
        Natural Language Query
      </h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Show all burglary cases in Mysore"
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            color: 'var(--text-primary)',
            fontSize: '15px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          style={{
            padding: '0 24px',
            borderRadius: '8px',
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            fontWeight: '600',
            cursor: isLoading || !query.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || !query.trim() ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
        >
          {isLoading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
          Execute
        </button>
      </form>
      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Suggestions:</span>
        {['Find cases involving gold theft', 'Show repeat offenders', 'Find cases after January 2025'].map(suggestion => (
          <button
            key={suggestion}
            onClick={() => { setQuery(suggestion); }}
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              color: 'var(--accent-primary)',
              borderRadius: '12px',
              padding: '2px 10px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QueryInput;
