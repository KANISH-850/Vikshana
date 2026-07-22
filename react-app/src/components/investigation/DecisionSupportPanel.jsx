import React, { useState, useEffect } from 'react';
import {
    Compass, Clock, FileText, Sparkles, CheckCircle2,
    Search, MapPin, ArrowRight, ShieldCheck, AlertCircle,
    BookOpen, Layers, Lightbulb, ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const DecisionSupportPanel = ({ caseId = '1' }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('summary');
    const [summary, setSummary] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [similarCases, setSimilarCases] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get(`/decision/summary/${caseId}`).catch(() => ({ data: { success: false } })),
            api.get(`/decision/timeline/${caseId}`).catch(() => ({ data: { success: false } })),
            api.get(`/decision/similar-cases/${caseId}`).catch(() => ({ data: { success: false } })),
            api.post('/decision/lead-recommendations', { caseId }).catch(() => ({ data: { success: false } }))
        ])
        .then(([sumRes, timeRes, simRes, leadRes]) => {
            if (sumRes.data?.success) setSummary(sumRes.data.data);
            if (timeRes.data?.success) setTimeline(timeRes.data.data);
            if (simRes.data?.success) setSimilarCases(simRes.data.data);
            if (leadRes.data?.success) setLeads(leadRes.data.data);
            setLoading(false);
        })
        .catch(err => {
            console.error('[DecisionSupportPanel] Error:', err);
            setLoading(false);
        });
    }, [caseId]);

    if (loading) {
        return (
            <div className="glass-panel" style={{ padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                Synthesising Decision Support Intelligence...
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Module Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Compass size={22} color="var(--accent-primary)" />
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            Investigator Decision Support
                        </h3>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Automated Case Summaries, Timeline Synthesis & Lead Recommendations
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub Tabs */}
            <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', flexWrap: 'wrap' }}>
                {[
                    { id: 'summary', label: 'Case Summary', icon: FileText },
                    { id: 'timeline', label: 'Automated Timeline', icon: Clock },
                    { id: 'similar', label: 'Similar Precedents', icon: Layers },
                    { id: 'leads', label: 'Lead Recommendations', icon: Lightbulb }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', borderRadius: '6px', border: 'none',
                            background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                            color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                            fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                        }}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab 1: Automatic Case Summary */}
            {activeTab === 'summary' && summary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                        <strong style={{ fontSize: '11px', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Overview</strong>
                        <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.5' }}>{summary.overview}</div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                        <strong style={{ fontSize: '11px', color: '#f59e0b', textTransform: 'uppercase' }}>Victim Summary</strong>
                        <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.5' }}>{summary.victimSummary}</div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                        <strong style={{ fontSize: '11px', color: '#ef4444', textTransform: 'uppercase' }}>Accused Summary</strong>
                        <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.5' }}>{summary.accusedSummary}</div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                        <strong style={{ fontSize: '11px', color: '#10b981', textTransform: 'uppercase' }}>Evidence & Status</strong>
                        <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.5' }}>{summary.evidenceSummary}</div>
                    </div>
                </div>
            )}

            {/* Tab 2: Automatic Timeline Generation */}
            {activeTab === 'timeline' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {timeline.map((t, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-tertiary)', borderLeft: '3px solid var(--accent-primary)' }}>
                            <div style={{ flexShrink: 0, fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', width: '130px' }}>
                                {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.type}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{t.title}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{t.description}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Source: {t.source}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tab 3: Similar Case Precedents */}
            {activeTab === 'similar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {similarCases.map((c, idx) => (
                        <div key={idx} style={{ padding: '12px 14px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{c.title}</strong>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{c.caseId}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{c.matchReason}</div>
                                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                    {c.evidenceMatch.map((e, i) => (
                                        <span key={i} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59,130,246,0.1)', color: 'var(--accent-primary)' }}>
                                            {e}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '8px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)' }}>
                                <div style={{ fontSize: '18px', fontWeight: '800', color: '#10b981' }}>{c.similarityScore}</div>
                                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>MATCH</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tab 4: Investigation Lead Recommendation */}
            {activeTab === 'leads' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {leads.map((l, idx) => (
                        <div key={idx} style={{ padding: '12px 14px', borderRadius: '8px', background: 'var(--bg-tertiary)', borderLeft: '3px solid #f59e0b' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <strong style={{ fontSize: '12px', color: '#f59e0b', textTransform: 'uppercase' }}>{l.category}</strong>
                                <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                    {l.confidence} CONFIDENCE
                                </span>
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{l.recommendation}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Reason: {l.reason}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DecisionSupportPanel;
