import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Network } from 'lucide-react';

const EvidenceCorrelationGraph = ({ correlations }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
    });

    if (correlations && chartRef.current) {
      let graphDefinition = 'graph TD;\n';
      
      correlations.forEach((corr, i) => {
        const src = (corr.source_evidence_id || 'Unknown').replace(/["\\]/g, '');
        const tgt = (corr.target_evidence_id || 'Unknown').replace(/["\\]/g, '');
        const rType = (corr.relationship_type || 'Linked').replace(/["\\]/g, '');
        graphDefinition += `  N${i}S["${src}"] -- "${rType}" --> N${i}T["${tgt}"];\n`;
      });

      if (correlations.length === 0) {
        graphDefinition += '  Empty["No cross-evidence correlations found"];\n';
      }

      mermaid.render(`mermaid-corr-${Date.now()}`, graphDefinition).then(({ svg }) => {
        if (chartRef.current) {
          chartRef.current.innerHTML = svg;
        }
      }).catch(err => console.error("Mermaid render error:", err));
    }
  }, [correlations]);

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Network size={18} color="var(--accent-primary)" />
        Cross-Evidence Correlation Graph
      </h3>
      <div 
        ref={chartRef} 
        style={{ 
          background: 'rgba(0,0,0,0.2)', 
          borderRadius: '8px', 
          padding: '20px',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          overflow: 'auto',
          minHeight: '250px'
        }} 
      />
    </div>
  );
};

export default EvidenceCorrelationGraph;
