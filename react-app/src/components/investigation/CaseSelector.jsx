import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ChevronRight, Loader2, AlertTriangle, FolderOpen } from 'lucide-react';
import api from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const CaseSelector = () => {
  const navigate = useNavigate();
  const { setSelectedCase, setCurrentCase } = useAppContext();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCaseId, setLoadingCaseId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/cases')
      .then(r => setCases(r.data.data || []))
      .catch(() => setError('Failed to load cases from Catalyst.'))
      .finally(() => setLoading(false));
  }, []);

  const handleOpen = async (c) => {
    setLoadingCaseId(c.id);
    try {
      const res = await api.get(`/cases/${c.id}/full-bundle`);
      const bundle = res.data.data;
      setSelectedCase(c);
      setCurrentCase(bundle);
      navigate(`/investigate/${c.id}`);
    } catch (err) {
      console.error('Failed to load case bundle:', err);
      // Still navigate even if bundle fails; workspace handles fallback
      setSelectedCase(c);
      setCurrentCase({ caseId: c.id, caseNumber: c.caseNumber, category: c.category, location: c.location });
      navigate(`/investigate/${c.id}`);
    } finally {
      setLoadingCaseId(null);
    }
  };

  const getCategoryColor = (cat) => {
    if (!cat) return '#94a3b8';
    const l = cat.toLowerCase();
    if (l.includes('murder') || l.includes('homicide')) return '#ef4444';
    if (l.includes('robbery') || l.includes('theft')) return '#f97316';
    if (l.includes('assault') || l.includes('kidnap')) return '#f59e0b';
    if (l.includes('fraud') || l.includes('cyber')) return '#8b5cf6';
    return '#3b82f6';
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px', color: 'var(--text-secondary)' }}>
      <Loader2 size={40} className="spin" color="var(--accent-primary)" />
      <p>Loading investigations from Catalyst...</p>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '24px', color: '#ef4444' }}>
      <AlertTriangle size={24} />
      <span>{error}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FolderOpen size={32} color="var(--accent-primary)" />
          Select Investigation
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '15px' }}>
          Choose an active case to load the Investigation Workspace, AI Chat, FIR summary, and all linked evidence.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {cases.map((c) => {
          const color = getCategoryColor(c.category);
          const isLoading = loadingCaseId === c.id;
          return (
            <div key={c.id} className="glass-panel" style={{ 
              padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '20px', 
              borderLeft: `4px solid ${color}`, transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onClick={() => !isLoading && handleOpen(c)}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ 
                    fontSize: '12px', fontWeight: '700', background: `${color}20`, color, 
                    padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase'
                  }}>
                    {c.category || 'Investigation'}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    {c.caseNumber || c.id}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '8px' }}>
                    {c.status || 'Active'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {c.location || 'N/A'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {c.date || 'N/A'}
                  </span>
                  {c.officer && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Search size={12} /> {c.officer}
                  </span>}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleOpen(c); }}
                disabled={isLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', background: 'var(--accent-primary)', color: 'white',
                  border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px',
                  cursor: isLoading ? 'wait' : 'pointer', flexShrink: 0, whiteSpace: 'nowrap'
                }}
              >
                {isLoading ? <Loader2 size={16} className="spin" /> : <ChevronRight size={16} />}
                {isLoading ? 'Loading...' : 'Open Investigation'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CaseSelector;
