import React, { useState, useMemo } from 'react';
import { User, Car, Phone, FileText, MapPin } from 'lucide-react';

const DEFAULT_NODES = [
  { id: '1', label: 'Vikram Sharma (Suspect)', type: 'person', status: 'Prime Accused', risk: 'High', x: 220, y: 120 },
  { id: '2', label: 'Rajesh Verma (Victim)', type: 'person', status: 'Complainant', risk: 'Low', x: 620, y: 120 },
  { id: '3', label: 'Sector 18 Exchange (Scene)', type: 'case', status: 'Crime Location', risk: 'Critical', x: 420, y: 250 },
  { id: '4', label: 'SUV MH-04-AB-1234', type: 'vehicle', status: 'Getaway Vehicle', risk: 'High', x: 180, y: 400 },
  { id: '5', label: '+91 98765 43210 (Phone)', type: 'phone', status: 'Intercepted Calls', risk: 'Medium', x: 420, y: 430 },
  { id: '6', label: 'Rahul Varma (Associate)', type: 'person', status: 'Accomplice', risk: 'Medium', x: 660, y: 400 }
];

const DEFAULT_EDGES = [
  { source: '1', target: '3', label: 'Spotted at Scene' },
  { source: '2', target: '3', label: 'Reported Incident' },
  { source: '1', target: '4', label: 'Registered Owner' },
  { source: '1', target: '5', label: 'Primary Cell Line' },
  { source: '1', target: '6', label: 'Known Accomplice' }
];

const getIcon = (type) => {
  switch (type) {
    case 'person': return <User size={20} color="#2563EB" />;
    case 'vehicle': return <Car size={20} color="#F59E0B" />;
    case 'phone': return <Phone size={20} color="#A855F7" />;
    case 'case': return <FileText size={20} color="#EF4444" />;
    default: return <MapPin size={20} color="#10B981" />;
  }
};

const calculateLayout = (inputNodes = [], width = 840, height = 520) => {
  const nodes = inputNodes.length > 0 ? inputNodes : DEFAULT_NODES;
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusX = width * 0.35;
  const radiusY = height * 0.32;

  return nodes.map((node, index) => {
    if (node.x !== undefined && node.y !== undefined) return node;
    const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2;
    return {
      ...node,
      x: Math.round(centerX + radiusX * Math.cos(angle)),
      y: Math.round(centerY + radiusY * Math.sin(angle))
    };
  });
};

const GraphView = ({ nodes = [], edges = [] }) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  const activeNodes = useMemo(() => {
    const rawNodes = nodes && nodes.length > 0 ? nodes : DEFAULT_NODES;
    return calculateLayout(rawNodes);
  }, [nodes]);

  const activeEdges = useMemo(() => {
    return edges && edges.length > 0 ? edges : DEFAULT_EDGES;
  }, [edges]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '540px', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.02)' }}>
      {/* Background Radar Grid Overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(37, 99, 235, 0.08) 1px, transparent 0)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />

      <svg width="100%" height="100%" viewBox="0 0 840 540" style={{ position: 'relative', zIndex: 1 }}>
        {/* Render Connection Edges */}
        {activeEdges.map((edge, i) => {
          const source = activeNodes.find((n) => String(n.id) === String(edge.source));
          const target = activeNodes.find((n) => String(n.id) === String(edge.target));
          if (!source || !target) return null;

          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          const labelText = edge.label || '';
          const pillWidth = Math.max(90, labelText.length * 7 + 16);

          return (
            <g key={i}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="#CBD5E1"
                strokeWidth="2"
                strokeDasharray="5 5"
              />
              {/* Edge Label Pill Background to prevent line overlap */}
              <rect
                x={midX - pillWidth / 2}
                y={midY - 11}
                width={pillWidth}
                height="22"
                rx="6"
                fill="#FFFFFF"
                stroke="#E5E7EB"
                strokeWidth="1"
              />
              <text
                x={midX}
                y={midY + 4}
                fill="#475569"
                fontSize="11"
                fontWeight="500"
                textAnchor="middle"
              >
                {labelText}
              </text>
            </g>
          );
        })}

        {/* Render Entity Nodes */}
        {activeNodes.map((node) => {
          const isHovered = hoveredNode && hoveredNode.id === node.id;
          const labelText = node.label || '';
          const labelWidth = Math.max(100, labelText.length * 7.2 + 16);

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Pulse Ring on Hover */}
              {isHovered && (
                <circle
                  r="36"
                  fill="rgba(37, 99, 235, 0.12)"
                  stroke="#2563EB"
                  strokeWidth="1.5"
                  style={{ transition: 'all 0.2s ease' }}
                />
              )}

              <circle
                r="26"
                fill="#FFFFFF"
                stroke={isHovered ? '#2563EB' : '#94A3B8'}
                strokeWidth={isHovered ? '3' : '2'}
                style={{ transition: 'all 0.2s ease', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))' }}
              />
              <foreignObject x="-10" y="-10" width="20" height="20">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                  {getIcon(node.type)}
                </div>
              </foreignObject>

              {/* Node Label Badge with White Background to prevent overlap */}
              <rect
                x={-labelWidth / 2}
                y="34"
                width={labelWidth}
                height="22"
                rx="6"
                fill="#FFFFFF"
                stroke={isHovered ? '#2563EB' : '#E5E7EB'}
                strokeWidth="1"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.04))' }}
              />
              <text
                y="49"
                fill="#111827"
                fontSize="11.5"
                fontWeight="600"
                textAnchor="middle"
              >
                {labelText}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover Entity Inspector Panel */}
      {hoveredNode && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '260px',
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '14px 16px',
          boxShadow: '0 10px 25px -4px rgba(0,0,0,0.1)',
          zIndex: 10,
          animation: 'fadeIn 0.15s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            {getIcon(hoveredNode.type)}
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>{hoveredNode.label}</h4>
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div><strong>Entity Type:</strong> {hoveredNode.type.toUpperCase()}</div>
            <div><strong>Status:</strong> {hoveredNode.status || 'Monitored'}</div>
            {hoveredNode.risk && (
              <div><strong>Risk Level:</strong> <span style={{ color: hoveredNode.risk === 'High' || hoveredNode.risk === 'Critical' ? '#EF4444' : '#2563EB', fontWeight: '600' }}>{hoveredNode.risk}</span></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphView;
