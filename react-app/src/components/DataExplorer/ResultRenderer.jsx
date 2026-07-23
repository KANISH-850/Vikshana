import React, { useState } from 'react';
import { Table, Download, FileJson } from 'lucide-react';

const ResultRenderer = ({ data, generatedSql }) => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'json'

  if (!data || data.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No results found for this query.
      </div>
    );
  }

  const columns = Object.keys(data[0] || {}).filter(k => k !== '_tableName');

  const exportCSV = () => {
    if (!data.length) return;
    const header = columns.join(',');
    const rows = data.map(row => columns.map(col => `"${String(row[col] || '').replace(/"/g, '""')}"`).join(','));
    const csv = [header, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_export_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px' }}>Query Results ({data.length})</h3>
          <div style={{ fontSize: '12px', color: 'var(--accent-primary)', marginTop: '4px', fontFamily: 'monospace', background: 'rgba(59,130,246,0.1)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
            {generatedSql}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', background: 'var(--glass-bg)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 10px',
                background: viewMode === 'table' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'table' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer'
              }}
              title="Table View"
            >
              <Table size={16} />
            </button>
            <button
              onClick={() => setViewMode('json')}
              style={{
                padding: '6px 10px',
                background: viewMode === 'json' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'json' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer'
              }}
              title="JSON View"
            >
              <FileJson size={16} />
            </button>
          </div>
          
          <button
            onClick={exportCSV}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--glass-border)',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px'
            }}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto', padding: viewMode === 'json' ? '20px' : '0' }}>
        {viewMode === 'table' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#1e293b', zIndex: 1 }}>
              <tr>
                {columns.map(col => (
                  <th key={col} style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '600', borderBottom: '1px solid var(--glass-border)' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  {columns.map(col => (
                    <td key={col} style={{ padding: '10px 16px', color: 'var(--text-primary)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={String(row[col])}>
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre style={{ margin: 0, color: 'var(--text-primary)', fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default ResultRenderer;
