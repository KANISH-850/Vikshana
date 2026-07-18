import React, { useState, useEffect } from 'react';
import GraphView from '../components/GraphView';
import { Network, RefreshCw } from 'lucide-react';
import api from '../services/api';

const RelationshipExplorer = () => {
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });

  const fetchNetwork = async () => {
    setLoading(true);
    try {
      const response = await api.get('/relationships');
      if (response.data.success) {
        setGraphData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch relationships", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '28px', color: 'var(--text-primary)' }}>Relationship Explorer</h1>
        <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>Discover hidden connections across entities.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Network color="var(--accent-primary)" size={24} />
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Entity Graph Network</h3>
          </div>
          <button onClick={fetchNetwork} disabled={loading} style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={16} /> {loading ? 'Analyzing...' : 'Refresh Network'}
          </button>
        </div>

        <GraphView nodes={graphData.nodes} edges={graphData.edges} />
      </div>
    </div>
  );
};

export default RelationshipExplorer;
