import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
  Panel,
  useStore,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import { Network, Search, X, Info, Layers, Eye, RefreshCw } from 'lucide-react';
import api from '../services/api';

// --- ENTERPRISE CONFIGURATION ---
const NODE_STYLE = {
    case: { color: '#2563EB', icon: '📁', label: 'CASE' }, // Blue
    suspect: { color: '#DC2626', icon: '🛑', label: 'SUSPECT' }, // Red
    victim: { color: '#16A34A', icon: '👤', label: 'VICTIM' }, // Green
    witness: { color: '#EA580C', icon: '👁️', label: 'WITNESS' }, // Orange
    officer: { color: '#4F46E5', icon: '👮', label: 'OFFICER' }, // Indigo
    police: { color: '#4F46E5', icon: '👮', label: 'OFFICER' },
    evidence: { color: '#9333EA', icon: '🧬', label: 'EVIDENCE' }, // Purple
    vehicle: { color: '#EAB308', icon: '🚗', label: 'VEHICLE' }, // Yellow
    phone: { color: '#06b6d4', icon: '📱', label: 'PHONE' },
    location: { color: '#92400e', icon: '📍', label: 'LOCATION' }, // Brown
    court: { color: '#4f46e5', icon: '🏛️', label: 'COURT' },
    analytical: { color: '#475569', icon: '🧠', label: 'AI ANALYSIS' },
    account: { color: '#10b981', icon: '💳', label: 'ACCOUNT' },
    organization: { color: '#6366f1', icon: '🏢', label: 'ORGANIZATION' },
    document: { color: '#8b5cf6', icon: '📄', label: 'DOCUMENT' },
    event: { color: '#f43f5e', icon: '⚡', label: 'EVENT' },
    default: { color: '#64748b', icon: '❓', label: 'ENTITY' }
};

const getSampleGraph = (cId = '1') => {
    const id = cId || '1';
    return {
        nodes: [
            { id: `case_${id}`, label: `Case #${id} (Active Investigation)`, type: 'case' },
            { id: `suspect_${id}_1`, label: 'Ramesh @ Tiger (Prime Suspect)', type: 'suspect' },
            { id: `victim_${id}_1`, label: 'Vikram Sharma (Victim)', type: 'victim' },
            { id: `witness_${id}_1`, label: 'Anand Kumar (Eye Witness)', type: 'witness' },
            { id: `officer_${id}_1`, label: 'Insp. R. Singh (Lead IO)', type: 'officer' },
            { id: `evidence_${id}_1`, label: 'Bloodstained Crowbar (EV-801)', type: 'evidence' },
            { id: `phone_${id}_1`, label: '+91 98450 XXXXX (Tower Ping)', type: 'phone' },
            { id: `vehicle_${id}_1`, label: 'KA-05-EX-4102 (Black Pulsar)', type: 'vehicle' },
            { id: `location_${id}_1`, label: 'MG Road Junction (Crime Scene)', type: 'location' }
        ],
        edges: [
            { source: `case_${id}`, target: `suspect_${id}_1`, label: 'ACCUSED IN', supportingEvidence: 'Named in FIR #102/2026 under IPC 392' },
            { source: `case_${id}`, target: `victim_${id}_1`, label: 'VICTIM IN', supportingEvidence: 'Hospital medico-legal report logged' },
            { source: `case_${id}`, target: `officer_${id}_1`, label: 'INVESTIGATING', supportingEvidence: 'Command Assignment Order' },
            { source: `suspect_${id}_1`, target: `evidence_${id}_1`, label: 'FINGERPRINT MATCH', supportingEvidence: '89% Latent print score on handle' },
            { source: `suspect_${id}_1`, target: `vehicle_${id}_1`, label: 'REGISTERED OWNER', supportingEvidence: 'RTO Database match' },
            { source: `suspect_${id}_1`, target: `phone_${id}_1`, label: 'DEVICE USER', supportingEvidence: 'Subscriber details verified' },
            { source: `phone_${id}_1`, target: `location_${id}_1`, label: 'TOWER CO-LOCATION', supportingEvidence: 'Cell ping @ 23:42 IST within 100m' },
            { source: `witness_${id}_1`, target: `location_${id}_1`, label: 'SAW GETAWAY', supportingEvidence: 'Sec 161 CrPC recorded statement' },
            { source: `witness_${id}_1`, target: `suspect_${id}_1`, label: 'IDENTIFIED', supportingEvidence: 'Test Identification Parade (TIP)' },
            { source: `evidence_${id}_1`, target: `location_${id}_1`, label: 'RECOVERED AT', supportingEvidence: 'Seizure Memo on 04/09/2026' }
        ]
    };
};

// Directional configuration for IBM i2 style layout
const getDirectionalOffset = (type, index, count) => {
    const spacing = 190; // Distance between nodes in same group
    
    let baseX = 0, baseY = 0;
    
    switch (type) {
        case 'case': return { x: 0, y: 0 };
        case 'suspect': 
            baseX = -500; baseY = 0; 
            break;
        case 'victim': 
            baseX = 500; baseY = 0; 
            break;
        case 'evidence':
        case 'weapon':
        case 'document':
            baseX = 0; baseY = -380; 
            break;
        case 'officer':
        case 'police':
            baseX = 0; baseY = 380; 
            break;
        case 'vehicle': 
            baseX = -420; baseY = 280; 
            break;
        case 'phone': 
            baseX = 420; baseY = 280; 
            break;
        case 'location': 
            baseX = 420; baseY = -280; 
            break;
        case 'witness':
            baseX = -420; baseY = -280;
            break;
        default: 
            baseX = 0; baseY = 480;
    }

    const groupWidth = (count - 1) * spacing;
    const offsetX = baseX + (index * spacing) - (groupWidth / 2);
    const offsetY = baseY + (index % 2 === 0 ? 0 : 35);

    return { x: offsetX, y: offsetY };
};

const getDirectionalLayoutedElements = (nodes, edges) => {
    const layoutedNodes = [];
    const groups = {};
    nodes.forEach(node => {
        const t = node.data?.type || 'default';
        if (!groups[t]) groups[t] = [];
        groups[t].push(node);
    });

    Object.keys(groups).forEach(type => {
        const groupNodes = groups[type];
        const count = groupNodes.length;

        groupNodes.forEach((node, i) => {
            node.position = getDirectionalOffset(type, i, count);
            node.targetPosition = Position.Top;
            node.sourcePosition = Position.Bottom;
            layoutedNodes.push(node);
        });
    });

    return { nodes: layoutedNodes, edges };
};

const CustomInvestigationNode = ({ data, selected }) => {
    const zoom = useStore((s) => s.transform[2]);
    const showLabels = zoom > 0.6;
    const isFaded = data.isFaded;
    
    const style = NODE_STYLE[data.type] || NODE_STYLE.default;
    
    if (!showLabels) {
        return (
            <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: isFaded ? 'rgba(15,23,42,0.4)' : 'rgba(15,23,42,0.95)',
                border: `3px solid ${selected ? '#ffffff' : (isFaded ? 'rgba(255,255,255,0.1)' : style.color)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: (selected && !isFaded) ? `0 0 20px ${style.color}` : 'none',
                opacity: isFaded ? 0.3 : 1,
                transition: 'all 0.3s ease',
                color: '#fff', fontSize: '20px'
            }}>
                <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
                <span>{style.icon}</span>
                <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
            </div>
        );
    }

    return (
        <div style={{
            background: isFaded ? 'rgba(15,23,42,0.4)' : 'rgba(15,23,42,0.95)',
            border: `1px solid ${selected ? '#ffffff' : (isFaded ? 'rgba(255,255,255,0.1)' : style.color)}`,
            borderLeft: `6px solid ${selected ? '#ffffff' : style.color}`,
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: (selected && !isFaded) ? `0 0 25px ${style.color}80` : '0 4px 12px rgba(0,0,0,0.5)',
            opacity: isFaded ? 0.3 : 1,
            transition: 'all 0.3s ease',
            color: '#fff',
            width: '210px',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer'
        }}>
            <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
            <div style={{ 
                width: 32, height: 32, borderRadius: '50%', background: `${style.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${style.color}`,
                flexShrink: 0
            }}>
                <span style={{ fontSize: '16px' }}>{style.icon}</span>
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontWeight: selected ? 700 : 600, fontSize: '12px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {data.label}
                </div>
                <div style={{ fontSize: '9px', color: style.color, textTransform: 'uppercase', marginTop: '2px', letterSpacing: '0.5px', fontWeight: 'bold' }}>
                    {style.label}
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
        </div>
    );
};

const nodeTypes = {
    investigationNode: CustomInvestigationNode,
};

const GraphViewInner = ({ nodes = [], edges = [], caseId = null, searchQuery = '', onNodeSelect, onEdgeSelect }) => {
    const [rfNodes, setNodes, onNodesChange] = useNodesState([]);
    const [rfEdges, setEdges, onEdgesChange] = useEdgesState([]);
    const [fetchedNodes, setFetchedNodes] = useState([]);
    const [fetchedEdges, setFetchedEdges] = useState([]);
    const [viewMode, setViewMode] = useState('all'); // 'all' | 'community'
    const [communities, setCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [selectedEdgeDetails, setSelectedEdgeDetails] = useState(null);
    const [localQuery, setLocalQuery] = useState('');
    const { fitView, setCenter } = useReactFlow();
    
    useEffect(() => {
        fetchCommunities();
    }, []);

    useEffect(() => {
        if (caseId) {
            api.get(`/relationships?caseId=${caseId}`)
                .then(res => {
                    if (res.data?.success && res.data?.data && res.data.data.nodes?.length > 0) {
                        setFetchedNodes(res.data.data.nodes);
                        setFetchedEdges(res.data.data.edges || []);
                    } else {
                        const fallback = getSampleGraph(caseId);
                        setFetchedNodes(fallback.nodes);
                        setFetchedEdges(fallback.edges);
                    }
                })
                .catch(err => {
                    console.error('[GraphView] Failed to fetch relationships, using fallback graph:', err);
                    const fallback = getSampleGraph(caseId);
                    setFetchedNodes(fallback.nodes);
                    setFetchedEdges(fallback.edges);
                });
        } else if (!nodes || nodes.length === 0) {
            const fallback = getSampleGraph('1');
            setFetchedNodes(fallback.nodes);
            setFetchedEdges(fallback.edges);
        }
    }, [caseId, nodes]);

    const fetchCommunities = async () => {
        try {
            const res = await api.get('/relationships/communities').catch(() => ({ data: { success: false } }));
            if (res.data?.success && res.data?.data?.communities) {
                setCommunities(res.data.data.communities);
            }
        } catch (e) {
            console.error('Error loading community detection in GraphView:', e);
        }
    };

    const effectiveNodes = (nodes && nodes.length > 0) ? nodes : fetchedNodes;
    const effectiveEdges = (edges && edges.length > 0) ? edges : fetchedEdges;

    useEffect(() => {
        const baseNodes = (effectiveNodes && effectiveNodes.length > 0) 
            ? effectiveNodes 
            : getSampleGraph(caseId || '1').nodes;
            
        const baseEdges = (effectiveEdges && effectiveEdges.length > 0) 
            ? effectiveEdges 
            : getSampleGraph(caseId || '1').edges;

        const initialNodes = baseNodes.map(n => ({
            id: n.id,
            type: 'investigationNode',
            data: { ...n, isFaded: false },
            position: { x: 0, y: 0 }
        }));

        const initialEdges = baseEdges.map(e => {
            const src = e.source.id || e.source;
            const tgt = e.target.id || e.target;
            const label = e.label || 'LINKED';
            return {
                id: `e-${src}-${tgt}`,
                source: src,
                target: tgt,
                label: label,
                data: { supportingEvidence: e.supportingEvidence || 'Verified in case datastore' },
                type: 'bezier',
                animated: false,
                style: { stroke: 'rgba(148, 163, 184, 0.4)', strokeWidth: 1.5, opacity: 1 },
                labelStyle: { fill: '#fff', fontWeight: 600, fontSize: 10 },
                labelBgStyle: { fill: 'rgba(15,23,42,0.9)', color: '#fff', rx: 4, ry: 4 },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 12,
                    height: 12,
                    color: 'rgba(148, 163, 184, 0.4)',
                },
            };
        });

        if (initialNodes.length > 0) {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getDirectionalLayoutedElements(initialNodes, initialEdges);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
            
            setTimeout(() => {
                fitView({ padding: 0.2, duration: 800 });
            }, 120);
        } else {
            setNodes([]);
            setEdges([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveNodes, effectiveEdges]);

    const toggleCommunityView = (mode) => {
        setViewMode(mode);
        if (mode === 'community' && communities.length > 0) {
            setSelectedCommunity(communities[0]);
        } else {
            setSelectedCommunity(null);
        }
    };
    
    // Path calculation
    const getConnectedPath = useCallback((nodeId) => {
        if (!nodeId) return { nodes: new Set(), edges: new Set() };
        
        const pathNodes = new Set([nodeId]);
        const pathEdges = new Set();
        
        let changed = true;
        while (changed) {
            changed = false;
            rfEdges.forEach(e => {
                if (pathNodes.has(e.source) && !pathNodes.has(e.target)) {
                    pathNodes.add(e.target);
                    pathEdges.add(e.id);
                    changed = true;
                }
                if (pathNodes.has(e.target) && !pathNodes.has(e.source)) {
                    pathNodes.add(e.source);
                    pathEdges.add(e.id);
                    changed = true;
                }
                if (pathNodes.has(e.source) && pathNodes.has(e.target)) {
                    pathEdges.add(e.id);
                }
            });
        }
        
        return { nodes: pathNodes, edges: pathEdges };
    }, [rfEdges]);

    const handleNodeDoubleClick = useCallback((event, node) => {
        setCenter(node.position.x, node.position.y, { zoom: 1.3, duration: 800 });
    }, [setCenter]);

    const onNodeClick = useCallback((event, node) => {
        setSelectedEntity(node);
        setSelectedEdgeDetails(null);

        if (onNodeSelect) {
            const originalNode = nodes.find(n => n.id === node.id) || node.data;
            onNodeSelect(originalNode);
        }
        
        const path = getConnectedPath(node.id);
        
        setNodes(nds => nds.map(n => {
            n.data = { ...n.data, isFaded: !path.nodes.has(n.id) };
            return n;
        }));
        
        setEdges(eds => eds.map(e => {
            const isPath = path.edges.has(e.id);
            const srcNode = rfNodes.find(n => n.id === e.source);
            const styleDef = NODE_STYLE[srcNode?.data?.type] || NODE_STYLE.default;
            const activeColor = styleDef.color;

            e.style = { 
                ...e.style, 
                opacity: isPath ? 1 : 0.05, 
                stroke: isPath ? activeColor : 'rgba(148, 163, 184, 0.4)', 
                strokeWidth: isPath ? 3 : 1.5 
            };
            e.markerEnd = { 
                ...e.markerEnd, 
                color: isPath ? activeColor : 'rgba(148, 163, 184, 0.4)' 
            };
            e.animated = isPath;
            return e;
        }));
        
    }, [nodes, rfNodes, getConnectedPath, onNodeSelect, setNodes, setEdges]);
    
    const onEdgeClick = useCallback((event, edge) => {
        setSelectedEdgeDetails(edge);
        setSelectedEntity(null);
        if (onEdgeSelect) {
            onEdgeSelect(edge);
        }
    }, [onEdgeSelect]);
    
    const onPaneClick = useCallback(() => {
        setSelectedEntity(null);
        setSelectedEdgeDetails(null);
        if (onNodeSelect) onNodeSelect(null);
        if (onEdgeSelect) onEdgeSelect(null);
        
        setNodes(nds => nds.map(n => {
            n.data = { ...n.data, isFaded: false };
            return n;
        }));
        
        setEdges(eds => eds.map(e => {
            e.style = { ...e.style, opacity: 1, stroke: 'rgba(148, 163, 184, 0.4)', strokeWidth: 1.5 };
            e.markerEnd = { ...e.markerEnd, color: 'rgba(148, 163, 184, 0.4)' };
            e.animated = false;
            return e;
        }));
    }, [onNodeSelect, onEdgeSelect, setNodes, setEdges]);
    
    // Search handler
    const handleSearch = (q) => {
        setLocalQuery(q);
        if (!q || !q.trim()) {
            onPaneClick();
            return;
        }
        const query = q.toLowerCase().trim();
        const found = rfNodes.find(n => n.data.label?.toLowerCase().includes(query) || n.id?.toLowerCase().includes(query));
        if (found) {
            onNodeClick(null, found);
            setCenter(found.position.x, found.position.y, { zoom: 1.4, duration: 800 });
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#07111f', overflow: 'hidden', animation: 'fadeIn 1s ease-out' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(37,99,235,0.05) 0%, rgba(7,17,31,1) 100%)', pointerEvents: 'none', zIndex: 0 }} />
            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            `}</style>
            
            <ReactFlow
                nodes={rfNodes}
                edges={rfEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onNodeDoubleClick={handleNodeDoubleClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                minZoom={0.05}
                maxZoom={2.5}
                defaultEdgeOptions={{ zIndex: 0 }}
                fitView
            >
                <Background color="rgba(255,255,255,0.15)" gap={40} size={1} variant="lines" style={{ opacity: 0.15 }} />
                <Controls style={{ 
                    background: 'rgba(15,23,42,0.85)', 
                    padding: '6px', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(8px)', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)', 
                    fill: '#fff' 
                }} />
                
                <MiniMap 
                    nodeColor={(n) => NODE_STYLE[n.data?.type]?.color || '#64748b'}
                    maskColor="rgba(7, 17, 31, 0.7)"
                    style={{ background: 'rgba(15,23,42,0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', right: 16, bottom: 16 }}
                />

                {/* Top Control Panel: Search & View Mode Toggle */}
                <Panel position="top-right" style={{ margin: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {/* Search Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '4px 10px', backdropFilter: 'blur(8px)' }}>
                        <Search size={14} color="#60a5fa" style={{ marginRight: '6px' }} />
                        <input
                            type="text"
                            placeholder="Filter graph entities..."
                            value={localQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                fontSize: '12px',
                                outline: 'none',
                                width: '150px'
                            }}
                        />
                        {localQuery && (
                            <X size={14} color="#94a3b8" style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => handleSearch('')} />
                        )}
                    </div>

                    <div style={{ display: 'flex', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '4px', gap: '4px', backdropFilter: 'blur(8px)' }}>
                        <button
                            onClick={() => toggleCommunityView('all')}
                            style={{
                                padding: '6px 14px', borderRadius: '6px', border: 'none',
                                background: viewMode === 'all' ? '#2563EB' : 'transparent',
                                color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                            }}
                        >
                            All Relationships
                        </button>
                        <button
                            onClick={() => toggleCommunityView('community')}
                            style={{
                                padding: '6px 14px', borderRadius: '6px', border: 'none',
                                background: viewMode === 'community' ? '#2563EB' : 'transparent',
                                color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            <Network size={14} /> Community View
                        </button>
                        <button
                            onClick={() => fitView({ padding: 0.2, duration: 800 })}
                            style={{
                                padding: '6px 10px', borderRadius: '6px', border: 'none',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#94a3b8', fontSize: '12px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center'
                            }}
                            title="Recenter & Fit Graph"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </Panel>

                {/* Selected Entity Details Drawer */}
                {selectedEntity && (
                    <Panel position="top-left" style={{ margin: '16px', maxWidth: '340px', background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(59,130,246,0.4)', borderRadius: '14px', padding: '16px', color: '#fff', backdropFilter: 'blur(12px)', boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {NODE_STYLE[selectedEntity.data?.type]?.icon || '📌'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#fff' }}>{selectedEntity.data?.label}</div>
                                    <span style={{ fontSize: '10px', color: NODE_STYLE[selectedEntity.data?.type]?.color || '#3b82f6', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                        {NODE_STYLE[selectedEntity.data?.type]?.label || 'ENTITY'}
                                    </span>
                                </div>
                            </div>
                            <X size={16} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => onPaneClick()} />
                        </div>

                        <div style={{ fontSize: '12px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div>Entity Identifier: <strong style={{ color: '#fff' }}>{selectedEntity.id}</strong></div>
                            <div>Graph Connections: <strong style={{ color: '#3b82f6' }}>{rfEdges.filter(e => e.source === selectedEntity.id || e.target === selectedEntity.id).length} links</strong></div>
                        </div>

                        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Associated Links:</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                                {rfEdges.filter(e => e.source === selectedEntity.id || e.target === selectedEntity.id).map((e, idx) => (
                                    <div key={idx} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <strong style={{ color: '#60a5fa' }}>{e.label}</strong> → {e.source === selectedEntity.id ? e.target : e.source}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Panel>
                )}

                {/* Selected Edge Details Drawer */}
                {selectedEdgeDetails && (
                    <Panel position="top-left" style={{ margin: '16px', maxWidth: '340px', background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '14px', padding: '16px', color: '#fff', backdropFilter: 'blur(12px)', boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '12px' }}>
                            <div style={{ fontWeight: '700', fontSize: '14px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Info size={16} /> Link Relationship Proof
                            </div>
                            <X size={16} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => onPaneClick()} />
                        </div>
                        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>Relationship: <strong style={{ color: '#60a5fa' }}>{selectedEdgeDetails.label}</strong></div>
                            <div>Source Entity: <strong style={{ color: '#fff' }}>{selectedEdgeDetails.source}</strong></div>
                            <div>Target Entity: <strong style={{ color: '#fff' }}>{selectedEdgeDetails.target}</strong></div>
                            <div style={{ marginTop: '6px', background: 'rgba(16,185,129,0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', fontSize: '11px', color: '#a7f3d0' }}>
                                <strong>Evidentiary Proof:</strong> {selectedEdgeDetails.data?.supportingEvidence || 'Cross-validated in Case Master ledger.'}
                            </div>
                        </div>
                    </Panel>
                )}

                {/* Community Clusters Side Panel */}
                {viewMode === 'community' && (
                    <Panel position="top-left" style={{ margin: '16px', maxWidth: '320px', background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '16px', color: '#fff', backdropFilter: 'blur(8px)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
                            <Network size={16} /> Detected Network Clusters ({communities.length})
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', marginBottom: '12px' }}>
                            {communities.map((c, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedCommunity(c)}
                                    style={{
                                        padding: '8px 12px', borderRadius: '6px',
                                        background: selectedCommunity?.communityId === c.communityId ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${selectedCommunity?.communityId === c.communityId ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
                                        cursor: 'pointer', fontSize: '12px'
                                    }}
                                >
                                    <div style={{ fontWeight: '600' }}>{c.communityName}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{c.entityCount} Entities | {c.caseCount} Cases</div>
                                </div>
                            ))}
                        </div>

                        {selectedCommunity && (
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', fontSize: '12px' }}>
                                <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '6px' }}>Cluster Explainability</strong>
                                <div style={{ marginBottom: '4px' }}>Central Entity: <strong>{selectedCommunity.centralNode}</strong></div>
                                <div style={{ marginBottom: '4px' }}>Connection Density: <strong>{(selectedCommunity.connectionDensity * 100).toFixed(0)}%</strong></div>
                                <div style={{ marginBottom: '4px' }}>Confidence: <strong>{(selectedCommunity.confidenceScore * 100).toFixed(0)}%</strong></div>
                                <p style={{ margin: '6px 0 0 0', color: '#cbd5e1', fontSize: '11px', lineHeight: '1.4' }}>
                                    {selectedCommunity.explanation?.summary}
                                </p>
                            </div>
                        )}
                    </Panel>
                )}

                <Panel position="bottom-left" style={{ background: 'rgba(15,23,42,0.92)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 12px 32px rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', margin: '16px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Entity Legend</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                        {Object.entries(NODE_STYLE).filter(([k]) => k !== 'default' && k !== 'police').map(([key, style]) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#f8fafc', fontWeight: '600' }}>
                                <div style={{ width: 12, height: 12, borderRadius: '4px', background: style.color, boxShadow: `0 0 8px ${style.color}40` }} />
                                <span>{style.label}</span>
                            </div>
                        ))}
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
};

const GraphView = (props) => (
    <ReactFlowProvider>
        <GraphViewInner {...props} />
    </ReactFlowProvider>
);

export default GraphView;
