import React, { useState } from 'react';
import { User, Car, Phone, FileText } from 'lucide-react';

const GraphView = ({ nodes, edges }) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  const getIcon = (type) => {
    switch (type) {
      case 'person': return <User size={24} color="var(--accent-primary)" />;
      case 'vehicle': return <Car size={24} color="var(--accent-warning)" />;
      case 'phone': return <Phone size={24} color="#a855f7" />;
      case 'case': return <FileText size={24} color="var(--accent-danger)" />;
      default: return <div />;
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
      <svg width="100%" height="100%">
        {edges.map((edge, i) => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          if (!source || !target) return null;
          return (
            <g key={i}>
              <line 
                x1={source.x} y1={source.y} x2={target.x} y2={target.y} 
                stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="4 4"
              />
              <text 
                x={(source.x + target.x) / 2} 
                y={(source.y + target.y) / 2 - 10} 
                fill="var(--text-secondary)" 
                fontSize="12" 
                textAnchor="middle"
              >
                {edge.label}
              </text>
            </g>
          );
        })}
        {nodes.map(node => (
          <g 
            key={node.id} 
            transform={`translate(${node.x}, ${node.y})`}
            onMouseEnter={() => setHoveredNode(node)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle r="30" fill="var(--bg-tertiary)" stroke="var(--glass-border)" strokeWidth="2" />
            <foreignObject x="-12" y="-12" width="24" height="24">
              {getIcon(node.type)}
            </foreignObject>
            <text y="45" fill="var(--text-primary)" fontSize="14" textAnchor="middle" fontWeight="500">{node.label}</text>
          </g>
        ))}
      </svg>

      {hoveredNode && (
        <div className="glass-panel" style={{ 
          position: 'absolute', top: '20px', right: '20px', width: '250px', padding: '16px' 
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{hoveredNode.label}</h4>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Type: {hoveredNode.type}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Status: Active Monitoring</p>
        </div>
      )}
    </div>
  );
};

export default GraphView;
