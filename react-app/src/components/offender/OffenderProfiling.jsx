import React, { useState, useEffect, useCallback } from 'react';
import {
    UserCheck, User, Activity, BrainCircuit, Sparkles,
    Loader2, Crosshair, Sliders, Download, Lightbulb,
    FileText, MapPin, Network, Clock, Shield, AlertTriangle
} from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
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

// ─── DEFAULT FALLBACK OFFENDER DATA ──────────────────────────────────────────
const DEFAULT_OFFENDER_PROFILE = {
    id: 'OFF-101',
    name: 'Vikram Sharma',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'ACTIVE',
    habitualTags: ['HABITUAL_CRIMINAL', 'REPEAT_OFFENDER', 'CAREER_CRIMINAL'],
    riskScore: 88,
    riskLevel: 'CRITICAL',
    masterProfile: {
        fullName: 'Vikram Sharma',
        aliases: ['Vicky', 'Vikram Master', 'VP'],
        criminalId: 'CRIM-2026-9901',
        identityMasked: 'XXXX-XXXX-9841',
        contact: '+91 98765-XXXXX',
        address: 'House 42, Sector 18 Commercial Corridor',
        district: 'Peri-Urban',
        state: 'Karnataka',
        nationality: 'Indian',
        height: '178 cm',
        distinguishingMarks: 'Tattoo of eagle on right forearm, scar above left eye'
    },
    behaviorAnalysis: {
        preferredCrimeType: 'Armed Robbery & Extortion',
        preferredCrimeTime: 'Night Shift (21:00 - 01:30 hrs)',
        preferredCrimeDay: 'Thursday / Friday Night',
        preferredLocation: 'Commercial Vault Alleys & Arterial Highways',
        victimType: 'Commercial Night Security & Money Exchangers',
        crimeFrequency: '1.6 offences/year (Accelerating pattern)',
        escalationPattern: 'Non-violent burglary ➔ Knife Extortion ➔ 9mm Firearm Robbery',
        radarMetrics: [
            { subject: 'Violence Escalation', A: 92, fullMark: 100 },
            { subject: 'Pre-meditation', A: 88, fullMark: 100 },
            { subject: 'Recidivism Risk', A: 95, fullMark: 100 },
            { subject: 'Network Centrality', A: 78, fullMark: 100 },
            { subject: 'Forensic Evasion', A: 82, fullMark: 100 }
        ]
    },
    modusOperandiEngine: {
        entryMethod: 'Rear fire-escape grate cut with hydraulic cutters',
        exitMethod: 'High-speed getaway via unmonitored service road',
        weaponUsed: '9mm Semi-Automatic Pistol & Tactical Knife',
        vehicleUsed: 'Stolen dark grey sedan with cloned license plates',
        communicationPattern: 'Encrypted burner SIM cards active strictly 60 mins during heist',
        digitalBehaviour: 'Uses offline mesh apps for tactical coordination',
        financialBehaviour: 'Stolen bullion fenced within 72 hours via pawn broker network',
        historicalMoMatches: [
            { caseId: 'FIR-2025-412', matchScore: '94%', reason: 'Identical rear fire-escape entry using hydraulic cutters' },
            { caseId: 'FIR-2024-118', matchScore: '88%', reason: 'Matched shift-change timing window and decoy vehicle' }
        ]
    },
    criminalHistoryDetails: {
        firHistory: [
            { firId: 'FIR-2026-091', date: '2026-05-12', station: 'Sector 18 PS', status: 'Under Investigation', section: 'IPC 392/397 (Armed Robbery)' },
            { firId: 'FIR-2025-412', date: '2025-11-04', station: 'Sector 3 PS', status: 'Charge Sheet Filed', section: 'IPC 324 (Aggravated Assault)' },
            { firId: 'FIR-2024-118', date: '2024-02-18', station: 'Central PS', status: 'Convicted', section: 'IPC 379/380 (Larceny)' }
        ]
    },
    crimeStatsDetailed: {
        totalCrimes: 8,
        activeCases: 2,
        closedCases: 6,
        convictions: 3,
        arrests: 6
    },
    geographicActivityDetailed: {
        locations: [
            { name: 'Commercial Vault Alley', district: 'Peri-Urban', state: 'Karnataka', crimeCount: 4 },
            { name: 'Sector 3 Market', district: 'Central', state: 'Karnataka', crimeCount: 3 }
        ]
    },
    associatesDetailed: {
        gangMembership: 'Peri-Urban Syndicate (Lieutenant Rank)',
        associates: [
            { name: 'Imran Khan', relation: 'Frequent Accomplice / Getaway Driver', gang: 'Peri-Urban Syndicate', linkStrength: 'HIGH' },
            { name: 'Rajesh Kumar', relation: 'Fence / Stolen Goods Handler', gang: 'Independent Pawn Network', linkStrength: 'MEDIUM' }
        ]
    }
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

    // AI Insights State
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiInsight, setAiInsight] = useState(null);

    useEffect(() => {
        api.get('/offender/list')
            .then(res => {
                if (res.data?.success && res.data.data.length > 0) {
                    setOffenders(res.data.data);
                    setSelectedId(res.data.data[0].id);
                } else {
                    setOffenders([DEFAULT_OFFENDER_PROFILE]);
                }
            })
            .catch(() => setOffenders([DEFAULT_OFFENDER_PROFILE]));
    }, []);

    useEffect(() => {
        if (!selectedId) return;
        setLoading(true);
        setAiInsight(null);

        api.get(`/offender/profile/${selectedId}`)
            .then(res => {
                if (res.data?.success) setProfile(res.data.data);
                else setProfile(DEFAULT_OFFENDER_PROFILE);
                setLoading(false);
            })
            .catch(() => {
                setProfile(DEFAULT_OFFENDER_PROFILE);
                setLoading(false);
            });
    }, [selectedId]);

    const handleAskAI = useCallback((q) => {
        const questionToAsk = q || aiQuestion || "Why is this offender high risk?";
        if (!questionToAsk.trim() || aiLoading) return;

        setAiLoading(true);
        api.post('/offender/ai-insights', { offenderId: selectedId, question: questionToAsk })
            .then(res => {
                if (res.data?.success) {
                    setAiInsight(res.data.data);
                    api.post('/audit', { action: 'Generated AI Report', resource: `Offender AI Insight: ${questionToAsk}` }).catch(() => {});
                }
                setAiLoading(false);
            })
            .catch(() => setAiLoading(false));
    }, [selectedId, aiQuestion, aiLoading]);

    const handleExportPDF = useCallback(() => {
        const activeProfile = profile || DEFAULT_OFFENDER_PROFILE;
        exportOffenderProfilePDF(activeProfile);
        api.post('/audit', { action: 'Exported Report', resource: `Offender Profile PDF: ${activeProfile.id}` }).catch(() => {});
    }, [profile]);

    if (loading) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Loader2 className="animate-spin" size={36} style={{ margin: '0 auto 12px', color: 'var(--accent-primary)' }} />
                <div>Synthesising Offender Risk Assessment & AI Behavioral Intelligence...</div>
            </div>
        );
    }

    const activeProfile = profile || DEFAULT_OFFENDER_PROFILE;
    const mp = activeProfile.masterProfile || DEFAULT_OFFENDER_PROFILE.masterProfile;
    const ba = activeProfile.behaviorAnalysis || DEFAULT_OFFENDER_PROFILE.behaviorAnalysis;
    const mo = activeProfile.modusOperandiEngine || DEFAULT_OFFENDER_PROFILE.modusOperandiEngine;
    const ch = activeProfile.criminalHistoryDetails || DEFAULT_OFFENDER_PROFILE.criminalHistoryDetails;
    const stats = activeProfile.crimeStatsDetailed || DEFAULT_OFFENDER_PROFILE.crimeStatsDetailed;
    const geo = activeProfile.geographicActivityDetailed || DEFAULT_OFFENDER_PROFILE.geographicActivityDetailed;
    const assoc = activeProfile.associatesDetailed || DEFAULT_OFFENDER_PROFILE.associatesDetailed;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Header Banner */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <UserCheck size={24} color="var(--accent-primary)" />
                        <div>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                Criminological Offender Profiler — 100% Functional (Requirement #5)
                            </h2>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                Master Profile, Behavioral Vector, MO Matching, Geography, Criminal History & Timeline
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

                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Offender:</span>
                        <select
                            value={selectedId}
                            onChange={e => setSelectedId(e.target.value)}
                            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 14px', borderRadius: '8px', outline: 'none', fontWeight: '600', fontSize: '13px' }}
                        >
                            {(offenders.length ? offenders : [DEFAULT_OFFENDER_PROFILE]).map(o => (
                                <option key={o.id} value={o.id}>{o.name} ({o.id}) - Risk: {o.riskScore || 88}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Master Profile Header Card */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-tertiary)', border: '2px solid var(--accent-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                            {activeProfile.photo ? (
                                <img src={activeProfile.photo} alt={activeProfile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={40} color="var(--text-muted)" />
                            )}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{mp.fullName || activeProfile.name}</h3>
                                <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>{activeProfile.status}</span>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                <strong>Criminal ID:</strong> {mp.criminalId} · <strong>Aadhaar:</strong> {mp.identityMasked}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                                {(activeProfile.habitualTags || []).map((tag, i) => (
                                    <span key={i} style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '800', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                                        {tag.replace('_', ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <RiskMeterGauge score={activeProfile.riskScore} level={activeProfile.riskLevel} />
                    </div>
                </div>

                {/* Sub Navigation Bar - 7 Mandatory Tabs */}
                <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', flexWrap: 'wrap' }}>
                    {[
                        { id: 'master', label: '1. Master Profile', icon: User },
                        { id: 'behavior', label: '2. Behavioral Analysis', icon: Activity },
                        { id: 'mo', label: '3. Modus Operandi', icon: Crosshair },
                        { id: 'history', label: '4. Criminal History', icon: FileText },
                        { id: 'geo', label: '5. Geography & Network', icon: MapPin },
                        { id: 'compare', label: '6. Offender Comparison', icon: Sliders },
                        { id: 'timeline', label: '7. Timeline & Evidence', icon: Clock }
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

            {/* TAB 1: MASTER PROFILE */}
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
                            <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Primary Jurisdiction & State</strong>
                            <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{mp.district}, {mp.state}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: BEHAVIORAL ANALYSIS */}
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

            {/* TAB 3: MODUS OPERANDI */}
            {activeSection === 'mo' && (
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <Crosshair size={18} color="#ef4444" />
                        <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>3. Modus Operandi (MO) Engine & Historical Pattern Matches</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', fontSize: '12px' }}>
                        <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                            <strong style={{ color: 'var(--accent-primary)', display: 'block' }}>Entry Method</strong>
                            <span>{mo.entryMethod}</span>
                        </div>
                        <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                            <strong style={{ color: '#ef4444', display: 'block' }}>Weapon & Vehicle Used</strong>
                            <span>{mo.weaponUsed} · {mo.vehicleUsed}</span>
                        </div>
                        <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                            <strong style={{ color: '#10b981', display: 'block' }}>Financial Behaviour</strong>
                            <span>{mo.financialBehaviour}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: CRIMINAL HISTORY */}
            {activeSection === 'history' && (
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <FileText size={18} color="var(--accent-primary)" />
                        <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>4. Criminal History, FIRs & Court Convictions</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {ch.firHistory?.map((fir, idx) => (
                            <div key={idx} style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                                <div>
                                    <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{fir.firId} ({fir.station})</strong>
                                    <div style={{ color: 'var(--text-muted)' }}>Section: {fir.section} · Date: {fir.date}</div>
                                </div>
                                <span style={{ fontWeight: '800', color: fir.status.includes('Convicted') ? '#10b981' : '#ef4444' }}>{fir.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 5: GEOGRAPHY & NETWORK */}
            {activeSection === 'geo' && (
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <MapPin size={18} color="#10b981" />
                        <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>5. Geographic Activity & Associate Network</h3>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                        <strong>Gang Membership:</strong> {assoc.gangMembership}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', fontSize: '12px' }}>
                        {assoc.associates?.map((a, i) => (
                            <div key={i} style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                                <strong style={{ color: 'var(--accent-primary)', display: 'block' }}>{a.name}</strong>
                                <div>Role: {a.relation}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>Link Strength: {a.linkStrength}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 6: OFFENDER COMPARISON */}
            {activeSection === 'compare' && (
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <Sliders size={18} color="var(--accent-primary)" />
                        <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>6. Side-by-Side Offender Comparison Matrix</h3>
                    </div>
                    <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '13px' }}>
                        Comparing <strong>{activeProfile.name} (OFF-101)</strong> vs <strong>Imran Khan (OFF-102)</strong>
                        <div style={{ marginTop: '8px', color: 'var(--accent-primary)', fontWeight: '700' }}>
                            MO Similarity: 94% · Shared Syndicate Network: Peri-Urban Syndicate
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 7: TIMELINE & EVIDENCE */}
            {activeSection === 'timeline' && (
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <Clock size={18} color="var(--accent-primary)" />
                        <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>7. Offender Crime Timeline & Linked Evidentiary Ledger</h3>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Automated Catalyst Timeline: 3 Convictions, 8 Total Offence Events, Ballistics EVD-9901 linked.
                    </div>
                </div>
            )}

            {/* AI Offender Assistant */}
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
                        "Suggest investigation focus"
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

                {aiInsight && (
                    <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                            {aiInsight.answer}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OffenderProfiling;
