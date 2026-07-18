import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const EvidenceLedger = () => {
  const [loading, setLoading] = useState(true);
  const [evidences, setEvidences] = useState([]);

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const response = await api.get('/evidence');
        if (response.data.success) {
          setEvidences(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch evidence", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvidence();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '28px', color: 'var(--text-primary)' }}>Evidence Ledger</h1>
        <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>Immutable record of AI claims and reasoning.</p>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Loading ledger...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {evidences.map(ev => (
          <div key={ev.id} className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '18px' }}>{ev.claim}</h3>
              <div style={{ background: 'var(--accent-success)', color: 'white', padding: '4px 12px', borderRadius: '16px', fontWeight: 'bold' }}>
                {ev.confidence} Confidence
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h4 style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} /> Supporting Evidence
                </h4>
                <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px', fontSize: '14px' }}>
                  {ev.supporting.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              
              <div>
                <h4 style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <XCircle size={16} /> Counter Evidence
                </h4>
                <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px', fontSize: '14px' }}>
                  {ev.counter.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            </div>
            
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '12px' }}>
              <Shield size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Sources: {ev.source}
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default EvidenceLedger;
