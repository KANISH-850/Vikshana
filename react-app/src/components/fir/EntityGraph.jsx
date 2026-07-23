import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

const EntityGraph = ({ relationships, aliases }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
    });

    if (relationships && chartRef.current) {
      let graphDefinition = 'graph TD;\n';
      
      relationships.forEach((rel, i) => {
        const src = rel.source_entity.replace(/["\\]/g, '');
        const tgt = rel.target_entity.replace(/["\\]/g, '');
        const rType = rel.relationship_type.replace(/["\\]/g, '');
        graphDefinition += `  N${i}S["${src}"] -- "${rType}" --> N${i}T["${tgt}"];\n`;
      });

      if (aliases) {
        aliases.forEach((al, i) => {
           const prim = al.primary_name.replace(/["\\]/g, '');
           const alias = al.alias_name.replace(/["\\]/g, '');
           graphDefinition += `  A${i}S["${alias}"] -. "Alias of" .-> A${i}T["${prim}"];\n`;
        });
      }

      if (relationships.length === 0 && (!aliases || aliases.length === 0)) {
        graphDefinition += '  Empty["No relationships found"];\n';
      }

      mermaid.render(`mermaid-svg-${Date.now()}`, graphDefinition).then(({ svg }) => {
        if (chartRef.current) {
          chartRef.current.innerHTML = svg;
        }
      }).catch(err => console.error("Mermaid render error:", err));
    }
  }, [relationships, aliases]);

  return (
    <div className="glass-panel" style={{ marginTop: '20px', padding: '20px' }}>
      <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 16px 0' }}>Entity Relationship Graph</h3>
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
          minHeight: '200px'
        }} 
      />
    </div>
  );
};

export default EntityGraph;
