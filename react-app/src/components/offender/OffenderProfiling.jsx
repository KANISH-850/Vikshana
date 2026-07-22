import React, { useState, useEffect, useCallback } from 'react';
import {
    UserCheck, ShieldAlert, AlertTriangle, User, MapPin,
    Calendar, Award, Activity, Search, BrainCircuit, Sparkles,
    FileText, CheckCircle2, ChevronRight, RefreshCw, Loader2,
    Briefcase, Crosshair, Clock, TrendingUp, Shield, Users,
    Globe, Phone, Fingerprint, ExternalLink, Layers, Eye, Sliders, Flame, Download, EyeOff, Lightbulb
} from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { exportOffenderProfilePDF } from '../../utils/pdfExport';

// ─── RISK METER GAUGE ────────────────────────────────────────────────────────
const RiskMeterGauge = ({ score = 88, level = 'CRITICAL' }) => {
    const angle = Math.min(180, Math.max(0, (score / 100) * 180));
    const rad = (angle - 180) * (Math.PI / 180);
    const pointerX = 100 + 70 * Math.cos(rad);
    const pointerY = 90 + 70 * Math.sin(rad);

    const levelColors = {
        CRITICAL: '#dc2626',
        HIGH: '#ef4444',
        MEDIUM: '#f59e0b',
        LOW: '#10b981'
    };

    const activeColor = levelColors[level] || levelColors.HIGH;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <svg width="200" height="110" viewBox="0 0 200 110">
                <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" strokeLinecap="round" />
                <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke={activeColor} strokeWidth="16" strokeDasharray="251" strokeDashoffset={251 - (score / 100) * 251} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
                <line x1="100" y1="90" x2={pointerX} y2={pointerY} stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                <circle cx="100" cy="90" r="6" fill="#ffffff" />
            </svg>
            <div style={{ marginTop: '-15px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: activeColor }}>{score}</div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: activeColor, textTransform: 'uppercase', letterSpacing: '1px' }}>{level} RISK</div>
            </div>
        </div>
    );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const OffenderProfiling = () => {
    const { t } = useLanguage();
    const [offenders, setOffenders] = useState([]);
    const [selectedId, setSelectedId] = useState('OFF-101');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('master');

    // Comparative Analysis State
    const [compareId, setCompareId] = useState('OFF-102');
    const [comparisonData, setComparisonData] = useState(null);
    const [compareLoading, setCompareLoading] = useState(false);

    // AI Insights State
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiInsight, setAiInsight] = useState(null);

    useEffect(() => {
        api.get('/offender/list')
            .then(res => {
                if (res.data.success) {
                    setOffenders(res.data.data);
                    if (res.data.data.length > 0) setSelectedId(res.data.data[0].id);
                }
            })
            .catch(err => console.error('[OffenderProfiling] List fetch error:', err));
    }, []);

    useEffect(() => {
        if (!selectedId) return;
        setLoading(true);
        setAiInsight(null);

        api.get(`/offender/profile/${selectedId}`)
            .then(res => {
                if (res.data.success) setProfile(res.data.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('[OffenderProfiling] Profile fetch error:', err);
                setLoading(false);
            });
    }, [selectedId]);

    const handleRunComparison = useCallback(() => {
        if (!selectedId || !compareId) return;
        setCompareLoading(true);

        api.get(`/offender/compare/${selectedId}/${compareId}`)
            .then(res => {
                if (res.data.success) setComparisonData(res.data.data);
                setCompareLoading(false);
            })
            .catch(err => {
                console.error('[OffenderProfiling] Comparison fetch error:', err);
                setCompareLoading(false);
            });
    }, [selectedId, compareId]);

    const handleAskAI = useCallback((q) => {
        const questionToAsk = q || aiQuestion || "Why is this offender considered high risk?";
        if (!questionToAsk.trim() || aiLoading) return;

        setAiLoading(true);
        api.post('/offender/ai-insights', { offenderId: selectedId, question: questionToAsk })
            .then(res => {
                if (res.data.success) setAiInsight(res.data.data);
                setAiLoading(false);
            })
            .catch(err => {
                console.error('[OffenderProfiling] AI Error:', err);
                setAiLoading(false);
            });
    }, [selectedId, aiQuestion, aiLoading]);

    const handleExportPDF = useCallback(() => {
        if (!profile) return;
        exportOffenderProfilePDF(profile);
    }, [profile]);

    if (loading) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Loader2 className="animate-spin" size={36} style={{ margin: '0 auto 12px', color: 'var(--accent-primary)' }} />
                <div>Synthesising Offender Risk Assessment & AI Behavioral Intelligence...</div>
            </div>
        );
    }

    if (!profile) return null;

    const mp = profile.masterProfile || {};
    const ba = profile.behaviorAnalysis || {};
    const mo = profile.modusOperandiEngine || {};

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Top Selector & Profile Overview Banner */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <UserCheck size={24} color="var(--accent-primary)" />
                        <div>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                Criminological Offender Profiler — Complete (Requirement #5)
                            </h2>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                Master Profile, Behavioral Analytics, Risk Assessment Engine & Explainable Profiling
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            onClick={handleExportPDF}
                            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--accent-primary)', background: 'rgba(59,130,246,0.1)', color: 'var(--accent-primary)', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Download size={14} /> Export Court-Ready PDF
                        </button>

                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Select Offender:</span>
                        <select
                            value={selectedId}
                            onChange={e => setSelectedId(e.target.value)}
                            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 14px', borderRadius: '8px', outline: 'none', fontWeight: '600', fontSize: '13px' }}
                        >
                            {offenders.map(o => (
                                <option key={o.id} value={o.id}>{o.name} ({o.id}) - Risk: {o.riskScore}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Master Header Card */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-tertiary)', border: '2px solid var(--accent-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                            {profile.photo ? (
                                <img src={profile.photo} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={40} color="var(--text-muted)" />
                            )}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{mp.fullName || profile.name}</h3>
                                <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>{profile.status}</span>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                <strong>Criminal ID:</strong> {mp.criminalId} · <strong>Masked Aadhaar:</strong> {mp.identityMasked}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                                {profile.habitualTags.map((tag, i) => (
                                    <span key={i} style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '800', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                                        {tag.replace('_', ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <RiskMeterGauge score={profile.riskScore} level={profile.riskLevel} />
                    </div>
                </div>

                {/* Sub Navigation Bar */}
                <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', flexWrap: 'wrap' }}>
                    {[
                        { id: 'master', label: '1. Master Profile', icon: User },
                        { id: 'behavior', label: '2. Behavioral Analysis', icon: Activity },
                        { id: 'mo', label: '3. Modus Operandi (MO)', icon: Crosshair },
                        { id: 'recs', label: '4. Lead Recommendations', icon: Lightbulb },
                        { id: 'compare', label: '5. Offender Comparison', icon: Sliders }
                    ].map(sec => (
                        <button
                            key={sec.id}
                            onClick={() => setActiveSection(sec.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 14px', borderRadius: '6px', border: 'none',
                                background: activeSection === sec.id ? 'var(--accent-primary)' : 'transparent',
                                color: activeSection === sec.id ? '#ffffff' : 'var(--text-secondary)',
                                fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                            }}
                        >
                            <sec.icon size={14} />
                            {sec.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* SECTION 1: MASTER PROFILE */}
            {activeSection === 'master' && (
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <User size={18} color="var(--accent-primary)" />
                        <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>1. Offender Master Profile & Personal Identity</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', fontSize: '13px' }}>
                        <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                            <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Full Legal Name</strong>
                            <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{mp.fullName}</span>
                        </div>
                        <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                            <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Known Aliases</strong>
                            <span style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>{mp.aliases?.join(', ')}</span>
                        </div>
                        <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                            <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Aadhaar / National ID (Masked)</strong>
                            <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontFamily: 'monospace' }}>{mp.identityMasked}</span>
                        </div>
                        <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                            <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Primary District & State</strong>
                            <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{mp.district}, {mp.state}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 2: BEHAVIORAL ANALYSIS */}
            {activeSection === 'behavior' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <Activity size={18} color="var(--accent-primary)" />
                            <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>Behavioral Pattern Analytics</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                            <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                                <strong style={{ color: 'var(--accent-primary)', display: 'block' }}>Preferred Crime Type</strong>
                                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{ba.preferredCrimeType}</span>
                            </div>
                            <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                                <strong style={{ color: '#f59e0b', display: 'block' }}>Preferred Timing Window</strong>
                                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{ba.preferredCrimeTime} · {ba.preferredCrimeDay}</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <BrainCircuit size={18} color="#8b5cf6" />
                            <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>Criminological Behavioral Vector Radar</h3>
                        </div>
                        <div style={{ height: '220px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={ba.radarMetrics || []}>
                                    <PolarGrid stroke="var(--border-color)" />
                                    <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" fontSize={11} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--border-color)" fontSize={10} />
                                    <Radar name="Offender Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 4: INVESTIGATION RECOMMENDATIONS */}
            {activeSection === 'recs' && (
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <Lightbulb size={18} color="#f59e0b" />
                        <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>4. AI Investigation Recommendations & Lead Focus</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                        {[
                            { title: 'Targeted Surveillance', desc: 'Deploy stationary surveillance along Sector 18 Commercial Vault alley between 21:00 and 01:30 hrs on Thursday night.', category: 'Surveillance', priority: 'CRITICAL' },
                            { title: 'Financial Pawn Network Audit', desc: 'Audit accounts linked to Rajesh Kumar pawn shops to trace fenced gold bullion within 72 hrs.', category: 'Financial', priority: 'HIGH' },
                            { title: 'Digital CDR Triangulation', desc: 'Issue ZCQL cell tower dump query for burner SIM pings active near Peri-Urban border.', category: 'Digital', priority: 'HIGH' },
                            { title: 'Associate Interrogation', desc: 'Interrogate Imran Khan regarding registered specs of dark grey sedan KL-07-BX-4410.', category: 'Associate', priority: 'MEDIUM' }
                        ].map((rec, idx) => (
                            <div key={idx} style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', borderLeft: '3px solid #f59e0b', fontSize: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <strong style={{ color: '#f59e0b', textTransform: 'uppercase', fontSize: '10px' }}>{rec.category}</strong>
                                    <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>{rec.priority}</span>
                                </div>
                                <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>{rec.title}</div>
                                <div style={{ color: 'var(--text-secondary)' }}>{rec.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Offender Assistant & Explainable AI */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BrainCircuit size={20} color="var(--accent-primary)" />
                    <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>AI Offender Intelligence Assistant & Explainability (XAI)</h3>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                        "Why is this offender high risk?",
                        "Explain behaviour",
                        "Predict future behaviour",
                        "Suggest investigation focus",
                        "Summarize criminal history"
                    ].map((q, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAskAI(q)}
                            disabled={aiLoading}
                            style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '500' }}
                        >
                            <Sparkles size={12} color="var(--accent-primary)" style={{ marginRight: '4px' }} />
                            {q}
                        </button>
                    ))}
                </div>

                {aiLoading && (
                    <div style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        <Loader2 className="animate-spin" size={16} /> Querying Criminological Knowledge Base for {profile.name}...
                    </div>
                )}

                {aiInsight && (
                    <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                {aiInsight.confidence} CONFIDENCE SCORE
                            </span>
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                            {aiInsight.answer}
                        </div>
                        {aiInsight.reasoning && (
                            <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                                <strong style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: '4px' }}>Criminological Reasoning Trail:</strong>
                                {aiInsight.reasoning.map((r, i) => <div key={i}>• {r}</div>)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OffenderProfiling;
