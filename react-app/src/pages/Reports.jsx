import React, { useState, useEffect } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import api from '../services/api';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(null);
  const [activeReport, setActiveReport] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/reports');
        if (response.data.success) {
          setReports(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch reports", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleGenerate = async (caseId) => {
    setGenerating(caseId);
    try {
      const response = await api.post('/reports/generate', { caseId });
      if (response.data.success) {
        setActiveReport({ id: caseId, markdown: response.data.data.markdown });
      }
    } catch (error) {
      console.error("Failed to generate report", error);
      alert("AI Generation failed.");
    } finally {
      setGenerating(null);
    }
  };

  if (activeReport) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Generated AI Report</h2>
          <button onClick={() => setActiveReport(null)} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
            Back to List
          </button>
        </div>
        <div className="glass-panel" style={{ padding: '24px', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', lineHeight: '1.6', overflowY: 'auto', flex: 1 }}>
          {activeReport.markdown}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '28px', color: 'var(--text-primary)' }}>Investigation Reports</h1>
        <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>Generate professional PDFs backed by AI findings.</p>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Loading reports...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {reports.map(report => (
            <div key={report.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <FileText size={24} color="var(--accent-primary)" />
                  <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px' }}>{report.title}</h3>
                </div>
                <div style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                  {report.status}
                </div>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', flex: 1 }}>{report.summary}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(report.date).toLocaleDateString()}</span>
                <button 
                  onClick={() => handleGenerate(report.id)}
                  disabled={generating === report.id}
                  style={{ background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {generating === report.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
                  {generating === report.id ? 'Synthesizing...' : 'Generate AI Report'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;
