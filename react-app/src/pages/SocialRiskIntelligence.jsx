import React, { useState, useEffect } from 'react';
import {
    ShieldAlert, TrendingUp, AlertTriangle, 
    Activity, Loader2, AlertCircle, Info,
    ChevronUp, ChevronDown, Users, BookOpen,
    Briefcase, Home, HeartPulse, Siren, Star
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer,
    RadialBarChart, RadialBar, Cell
} from 'recharts';

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_SCORE_DATA = {
    currentScore: 72,
    previousScore: 65,
    maxScore: 100,
    level: 'HIGH',
    lastUpdated: '2026-07-22',
    derivation: {
        methodology: 'Weighted composite of 6 socio-economic and criminal justice indicators. Each factor is normalised on a 0-100 scale, then multiplied by its assigned weight derived from causal inference regression on 5-year historical data.',
        weights: [
            { factor: 'Youth Unemployment', weight: 0.25, rawValue: 15.2, score: 80, icon: 'briefcase' },
            { factor: 'Education Disparity', weight: 0.20, rawValue: 45.0, score: 72, icon: 'book' },
            { factor: 'Housing Insecurity', weight: 0.18, rawValue: 22.3, score: 68, icon: 'home' },
            { factor: 'Substance Abuse Index', weight: 0.16, rawValue: 34.1, score: 65, icon: 'heart' },
            { factor: 'Repeat Offending Rate', weight: 0.13, rawValue: 28.5, score: 58, icon: 'siren' },
            { factor: 'Community Cohesion', weight: 0.08, rawValue: 41.0, score: 42, icon: 'users' },
        ]
    }
};

const MOCK_TIMELINE = [
    { month: 'Jan', score: 48, events: 'New community program launched' },
    { month: 'Feb', score: 52, events: null },
    { month: 'Mar', score: 58, events: 'Factory closure — 800 jobs lost' },
    { month: 'Apr', score: 62, events: null },
    { month: 'May', score: 59, events: 'Sector 3 intervention' },
    { month: 'Jun', score: 64, events: null },
    { month: 'Jul', score: 72, events: 'Youth unemployment spike' },
];

const MOCK_DISTRICT_RANKING = [
    { district: 'Central', score: 72, change: +7, level: 'HIGH' },
    { district: 'North', score: 65, change: +3, level: 'MEDIUM' },
    { district: 'East', score: 58, change: -2, level: 'MEDIUM' },
    { district: 'West', score: 45, change: -5, level: 'LOW' },
    { district: 'South', score: 38, change: -1, level: 'LOW' },
    { district: 'Peri-Urban', score: 81, change: +12, level: 'CRITICAL' },
];

const MOCK_RISK_BREAKDOWN = [
    { name: 'Economic', value: 42, fill: '#ef4444' },
    { name: 'Educational', value: 28, fill: '#f59e0b' },
    { name: 'Social', value: 18, fill: '#8b5cf6' },
    { name: 'Environmental', value: 12, fill: '#10b981' },
];

const MOCK_HISTORICAL = [
    { year: '2021', avgScore: 38 },
    { year: '2022', avgScore: 44 },
    { year: '2023', avgScore: 51 },
    { year: '2024', avgScore: 58 },
    { year: '2025', avgScore: 63 },
    { year: '2026', avgScore: 72 },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────────
const getRiskColor = (level) => {
    switch (level) {
        case 'CRITICAL': return '#dc2626';
        case 'HIGH': return '#ef4444';
        case 'MEDIUM': return '#f59e0b';
        case 'LOW': return '#10b981';
        default: return '#6b7280';
    }
};

const getRiskBg = (level) => {
    switch (level) {
        case 'CRITICAL': return 'rgba(220,38,38,0.15)';
        case 'HIGH': return 'rgba(239,68,68,0.12)';
        case 'MEDIUM': return 'rgba(245,158,11,0.12)';
        case 'LOW': return 'rgba(16,185,129,0.12)';
        default: return 'rgba(107,114,128,0.1)';
    }
};

const getFactorIcon = (icon) => {
    const props = { size: 16 };
    switch (icon) {
        case 'briefcase': return <Briefcase {...props} />;
        case 'book': return <BookOpen {...props} />;
        case 'home': return <Home {...props} />;
        case 'heart': return <HeartPulse {...props} />;
        case 'siren': return <Siren {...props} />;
        case 'users': return <Users {...props} />;
        default: return <Activity {...props} />;
    }
};

const TooltipStyle = {
    contentStyle: { backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' },
    itemStyle: { color: 'var(--text-primary)' }
};

// ─── SUB-COMPONENTS ─────────────────────────────────────────────────────────────

/**
 * RiskMeter — Semicircular gauge showing the composite risk score.
 */
const RiskMeter = ({ score, level }) => {
    const radius = 90;
    const circumference = Math.PI * radius; // half circle
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const color = getRiskColor(level);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <svg width="220" height="130" viewBox="0 0 220 130">
                {/* Background arc */}
                <path
                    d="M 20 115 A 90 90 0 0 1 200 115"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="18"
                    strokeLinecap="round"
                />
                {/* Colored arc */}
                <path
                    d="M 20 115 A 90 90 0 0 1 200 115"
                    fill="none"
                    stroke={color}
                    strokeWidth="18"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 1.2s ease-in-out', filter: `drop-shadow(0 0 8px ${color}80)` }}
                />
                {/* Score text */}
                <text x="110" y="105" textAnchor="middle" fontSize="38" fontWeight="800" fill="var(--text-primary)">{score}</text>
                <text x="110" y="122" textAnchor="middle" fontSize="11" fill="var(--text-secondary)">out of 100</text>
                {/* Scale labels */}
                <text x="16" y="128" textAnchor="middle" fontSize="10" fill="var(--text-muted)">0</text>
                <text x="110" y="18" textAnchor="middle" fontSize="10" fill="var(--text-muted)">50</text>
                <text x="204" y="128" textAnchor="middle" fontSize="10" fill="var(--text-muted)">100</text>
            </svg>
            <div style={{
                padding: '6px 18px', borderRadius: '20px',
                background: getRiskBg(level), border: `1px solid ${color}60`,
                color, fontWeight: '700', fontSize: '13px', letterSpacing: '1px'
            }}>
                {level} RISK
            </div>
        </div>
    );
};

/**
 * ScoreCard — Main card showing the composite risk score, level, and delta.
 */
const ScoreCard = ({ data }) => {
    const delta = data.currentScore - data.previousScore;
    const color = getRiskColor(data.level);

    return (
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <ShieldAlert size={18} color={color} />
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Composite Social Risk Score</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '280px', lineHeight: '1.5' }}>
                        Derived from 6 weighted socio-economic indicators using causal inference regression.
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Updated</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>{data.lastUpdated}</div>
                </div>
            </div>

            <RiskMeter score={data.currentScore} level={data.level} />

            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Previous Score</div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-secondary)' }}>{data.previousScore}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Change</div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: delta > 0 ? 'var(--accent-danger)' : 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {delta > 0 ? <ChevronUp size={20} /> : <ChevronDown size={20} />} {delta > 0 ? '+' : ''}{delta}
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Max Score</div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-secondary)' }}>{data.maxScore}</div>
                </div>
            </div>
        </div>
    );
};

/**
 * ScoreDerivation — Explains how the score was derived factor by factor.
 */
const ScoreDerivation = ({ derivation }) => {
    return (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={18} color="var(--accent-primary)" />
                <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontWeight: '700' }}>How This Score Was Derived</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)' }}>
                {derivation.methodology}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '8px', padding: '0 4px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Factor</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Weight</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Raw Value</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Score</span>
                </div>
                {derivation.weights.map((w, idx) => {
                    const contribution = Math.round(w.weight * w.score);
                    const barColor = w.score >= 70 ? '#ef4444' : w.score >= 50 ? '#f59e0b' : '#10b981';
                    return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '8px', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ color: barColor }}>{getFactorIcon(w.icon)}</div>
                                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{w.factor}</span>
                                </div>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', fontWeight: '600' }}>{(w.weight * 100).toFixed(0)}%</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>{w.rawValue}</span>
                                <span style={{ fontSize: '13px', color: barColor, fontWeight: '700', textAlign: 'center' }}>{w.score}</span>
                            </div>
                            {/* Progress bar */}
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${w.score}%`, background: barColor, borderRadius: '4px', transition: 'width 1s ease' }} />
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
                                Contributes <strong style={{ color: barColor }}>{contribution} pts</strong> to composite score
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * RiskTimeline — Month-by-month score trend with key event annotations.
 */
const RiskTimeline = ({ data }) => {
    const CustomDot = (props) => {
        const { cx, cy, payload } = props;
        if (!payload.events) return <circle cx={cx} cy={cy} r={5} fill="var(--accent-primary)" stroke="var(--bg-secondary)" strokeWidth={2} />;
        return (
            <g>
                <circle cx={cx} cy={cy} r={8} fill="#f59e0b" stroke="var(--bg-secondary)" strokeWidth={2} />
                <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#000">!</text>
            </g>
        );
    };

    return (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color="var(--accent-primary)" />
                    <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontWeight: '700' }}>Risk Timeline (2026)</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }} />Normal</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />Key Event</div>
                </div>
            </div>
            <div style={{ height: '220px' }}>
                <ResponsiveContainer>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                        <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                        <YAxis domain={[30, 100]} stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                        <RechartsTooltip 
                            {...TooltipStyle}
                            content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;
                                const d = data.find(x => x.month === label);
                                return (
                                    <div style={{ ...TooltipStyle.contentStyle, padding: '10px 14px' }}>
                                        <div style={{ fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>{label}</div>
                                        <div style={{ fontSize: '13px', color: '#ef4444' }}>Score: {payload[0].value}</div>
                                        {d?.events && <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px', maxWidth: '180px' }}>⚠ {d.events}</div>}
                                    </div>
                                );
                            }}
                        />
                        <Area type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={2.5} fill="url(#riskGrad)" dot={<CustomDot />} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            {/* Event legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.filter(d => d.events).map((d, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px 12px', background: 'rgba(245,158,11,0.08)', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '1px' }} />
                        <div>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#f59e0b' }}>{d.month}:</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '6px' }}>{d.events}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * ContributingFactors — Horizontal ranked list of top risk drivers.
 */
const ContributingFactors = ({ factors }) => {
    const sorted = [...factors].sort((a, b) => b.score - a.score);
    return (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="var(--accent-warning)" />
                <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontWeight: '700' }}>Top Contributing Factors</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sorted.map((factor, idx) => {
                    const barColor = factor.score >= 70 ? '#ef4444' : factor.score >= 50 ? '#f59e0b' : '#10b981';
                    return (
                        <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ 
                                width: '26px', height: '26px', borderRadius: '50%', 
                                background: idx === 0 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '11px', fontWeight: '800', color: idx === 0 ? '#ef4444' : 'var(--text-secondary)',
                                flexShrink: 0
                            }}>#{idx + 1}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{factor.factor}</span>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: barColor }}>{factor.score}/100</span>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${factor.score}%`, background: `linear-gradient(90deg, ${barColor}88, ${barColor})`, borderRadius: '6px', transition: 'width 1.2s ease' }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * DistrictRanking — Ranked table of districts by risk score.
 */
const DistrictRanking = ({ districts }) => {
    const sorted = [...districts].sort((a, b) => b.score - a.score);
    return (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={18} color="var(--accent-primary)" />
                <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontWeight: '700' }}>District Risk Ranking</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sorted.map((d, idx) => {
                    const color = getRiskColor(d.level);
                    return (
                        <div key={idx} style={{ 
                            display: 'flex', alignItems: 'center', gap: '12px', 
                            padding: '12px 14px', borderRadius: '8px', 
                            background: idx === 0 ? getRiskBg(d.level) : 'var(--bg-tertiary)',
                            border: idx === 0 ? `1px solid ${color}40` : '1px solid var(--border-color)',
                            transition: 'transform 0.1s',
                        }}>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', width: '20px', flexShrink: 0 }}>#{idx + 1}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{d.district} District</div>
                            </div>
                            <div style={{ padding: '3px 8px', borderRadius: '12px', background: `${color}20`, fontSize: '10px', fontWeight: '700', color, letterSpacing: '0.5px' }}>
                                {d.level}
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '800', color, width: '36px', textAlign: 'right' }}>{d.score}</div>
                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '700', color: d.change > 0 ? '#ef4444' : '#10b981', width: '42px', justifyContent: 'flex-end' }}>
                                {d.change > 0 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                {d.change > 0 ? '+' : ''}{d.change}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * HistoricalTrend — Multi-year risk score trend chart.
 */
const HistoricalTrend = ({ data }) => {
    return (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="var(--accent-danger)" />
                <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontWeight: '700' }}>Historical Trend (5-Year)</h3>
            </div>
            <div style={{ height: '220px' }}>
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                        <XAxis dataKey="year" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                        <YAxis domain={[0, 100]} stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                        <RechartsTooltip {...TooltipStyle} formatter={(v) => [`${v}/100`, 'Risk Score']} />
                        <Bar dataKey="avgScore" name="Avg Risk Score" radius={[6, 6, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={index} fill={entry.avgScore >= 70 ? '#ef4444' : entry.avgScore >= 50 ? '#f59e0b' : '#10b981'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>5-Year trajectory</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#ef4444' }}>↑ +34 pts since 2021</span>
            </div>
        </div>
    );
};

/**
 * RiskBreakdown — Donut-style breakdown of risk by category with detailed percentages.
 */
const RiskBreakdown = ({ data }) => {
    return (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--accent-primary)" />
                <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontWeight: '700' }}>Risk Category Breakdown</h3>
            </div>
            <div style={{ height: '200px' }}>
                <ResponsiveContainer>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={data} startAngle={90} endAngle={-270}>
                        <RadialBar dataKey="value" cornerRadius={4} label={false}>
                            {data.map((entry, index) => (
                                <Cell key={index} fill={entry.fill} />
                            ))}
                        </RadialBar>
                        <RechartsTooltip {...TooltipStyle} formatter={(v) => [`${v}%`, 'Share']} />
                    </RadialBarChart>
                </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.fill, flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', flex: 1 }}>{item.name}</span>
                        <div style={{ height: '6px', width: '100px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${item.value}%`, background: item.fill, borderRadius: '6px' }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: item.fill, width: '32px', textAlign: 'right' }}>{item.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────
const SocialRiskIntelligence = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scoreData] = useState(MOCK_SCORE_DATA);
    const [timeline] = useState(MOCK_TIMELINE);
    const [districts] = useState(MOCK_DISTRICT_RANKING);
    const [historical] = useState(MOCK_HISTORICAL);
    const [breakdown] = useState(MOCK_RISK_BREAKDOWN);

    useEffect(() => {
        // Simulate loading — swap with api.get('/sociological/social-risk') calls when ready
        const t = setTimeout(() => setLoading(false), 900);
        return () => clearTimeout(t);
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', color: 'var(--text-secondary)' }}>
                <Loader2 className="animate-spin" size={40} style={{ marginBottom: '16px', color: '#ef4444' }} />
                <h3 style={{ color: 'var(--text-primary)' }}>Calculating Social Risk Index...</h3>
                <p>Aggregating 6 socio-economic indicators</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', border: '1px solid var(--accent-danger)' }}>
                <AlertCircle size={48} color="var(--accent-danger)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ color: 'var(--text-primary)' }}>Risk Engine Error</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Alert Banner if CRITICAL/HIGH */}
            {['CRITICAL', 'HIGH'].includes(scoreData.level) && (
                <div style={{ 
                    padding: '14px 18px', borderRadius: '10px', 
                    background: scoreData.level === 'CRITICAL' ? 'rgba(220,38,38,0.15)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${getRiskColor(scoreData.level)}40`,
                    display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                    <Siren size={20} color={getRiskColor(scoreData.level)} style={{ flexShrink: 0 }} />
                    <div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: getRiskColor(scoreData.level) }}>
                            {scoreData.level} RISK ALERT
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                            Composite social risk score has increased by {scoreData.currentScore - scoreData.previousScore} points since the last assessment. Immediate review recommended.
                        </span>
                    </div>
                </div>
            )}

            {/* Row 1: Score Card + Score Derivation */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 400px) 1fr', gap: '20px' }}>
                <ScoreCard data={scoreData} />
                <ScoreDerivation derivation={scoreData.derivation} />
            </div>

            {/* Row 2: Timeline + Contributing Factors */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                <RiskTimeline data={timeline} />
                <ContributingFactors factors={scoreData.derivation.weights} />
            </div>

            {/* Row 3: District Ranking + Historical + Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <DistrictRanking districts={districts} />
                <HistoricalTrend data={historical} />
                <RiskBreakdown data={breakdown} />
            </div>

        </div>
    );
};

export default SocialRiskIntelligence;
