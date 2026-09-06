import React, { useState, useEffect } from 'react';
import { ArrowRight, Share2, Compass, ShieldCheck, CheckCircle2, Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const SAMPLE_HISTORICAL_CASES = [
    {
        caseId: 'CR-2024-8841',
        similarityScore: 94,
        crimeType: 'IPC 392/302 - Aggravated Robbery & Homicide',
        isSample: true,
        matchDetails: {
            crimeType: 'IPC Section 302 / 392 (Armed Assault)',
            mo: 'High-speed motorcycle getaway; targeted night transit corridor near MG Road metro station; utilized non-traceable burner SIMs.',
            location: 'Central Police Precinct (Sector 4)',
            temporal: 'Recorded within 3.2km radius during 23:00 - 02:00 window',
            sharedEntities: 'Suspect alias "Ketan @ Chotu" & black Pulsar 220 (KA-05-EX-4102)'
        },
        resolution: 'Chargesheet filed under IPC 392/302/34; Conviction secured in 3rd Sessions Court.'
    },
    {
        caseId: 'CR-2023-5129',
        similarityScore: 88,
        crimeType: 'IPC 380/457 - Larceny & Night Trespass',
        isSample: true,
        matchDetails: {
            crimeType: 'IPC Section 380 / 457 (Forced Commercial Breach)',
            mo: 'Forced rear door entry using hydraulic crowbar; disabled CCTV power line prior to entry; pawn shop liquidation pathway.',
            location: 'North Industrial District (Precinct 9)',
            temporal: 'Midnight breach during weekend shift change',
            sharedEntities: 'Common fence contact "Ramesh Traders" & pawn ledger records'
        },
        resolution: 'Stolen assets (Rs 18.5 Lakhs) recovered; 3 gang members convicted.'
    },
    {
        caseId: 'CR-2023-1092',
        similarityScore: 82,
        crimeType: 'IPC 420/120B - Cyber Phishing & Financial Fraud',
        isSample: true,
        matchDetails: {
            crimeType: 'IPC Section 420 / 120B (Multi-tier Phishing & Financial Fraud)',
            mo: 'Fake banking portal SMS phishing; instant UPI shell transfer to multi-layer money mule accounts within 15 minutes.',
            location: 'Cyber Crime Division HQ',
            temporal: 'Inter-state money transfers during banking business hours',
            sharedEntities: 'Matched bank account prefix (91823XXXXX) & Telegram bot handle'
        },
        resolution: 'Rs 14.5 Lakhs frozen by Cyber Cell; Mule account network dismantled.'
    }
];

const HistoricalIntelligencePanel = ({ caseId = '' }) => {
    const navigate = useNavigate();
    const [similarCases, setSimilarCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showingSamples, setShowingSamples] = useState(false);

    useEffect(() => {
        if (!caseId) {
            setSimilarCases(SAMPLE_HISTORICAL_CASES);
            setShowingSamples(true);
            setLoading(false);
            return;
        }
        setLoading(true);
        api.get(`/decision/similar-cases/${caseId}`)
            .then((simRes) => {
                const fetched = simRes.data?.data || simRes.data?.cases || [];
                if (fetched.length > 0) {
                    setSimilarCases(fetched);
                    setShowingSamples(false);
                } else {
                    setSimilarCases(SAMPLE_HISTORICAL_CASES);
                    setShowingSamples(true);
                }
                setLoading(false);
            })
            .catch(err => {
                console.debug('[HistoricalIntelligencePanel] Error loading similar cases, displaying sample precedents:', err);
                setSimilarCases(SAMPLE_HISTORICAL_CASES);
                setShowingSamples(true);
                setLoading(false);
            });
    }, [caseId]);

    const activeCasesToDisplay = (similarCases && similarCases.length > 0) ? similarCases : SAMPLE_HISTORICAL_CASES;

    if (loading) {
        return (
            <div className="glass-panel" style={{ padding: '32px', color: 'var(--text-muted)', fontSize: '14px', borderRadius: '16px', display: 'flex', gap: '14px', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
                <div className="spin"><Compass size={26} color="var(--accent-primary)" /></div>
                <span>Querying historical datastores for statistical precedents...</span>
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>
            {/* Header section with seamless theme styling */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '18px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.12)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Share2 size={24} color="var(--accent-primary)" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.3px' }}>
                            Historical Intelligence & Precedents
                            {showingSamples && (
                                <span style={{ fontSize: '11px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', padding: '3px 10px', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.3)', fontWeight: '600' }}>
                                    Sample Precedents Active
                                </span>
                            )}
                        </h3>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                            Statistically matching historical case precedents in the datastore to inform tactical strategy.
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        if (showingSamples) {
                            setLoading(true);
                            api.get(`/decision/similar-cases/${caseId || '1'}`)
                                .then(res => {
                                    const fetched = res.data?.data || res.data?.cases || [];
                                    setSimilarCases(fetched.length > 0 ? fetched : SAMPLE_HISTORICAL_CASES);
                                    setShowingSamples(fetched.length === 0);
                                })
                                .finally(() => setLoading(false));
                        } else {
                            setSimilarCases(SAMPLE_HISTORICAL_CASES);
                            setShowingSamples(true);
                        }
                    }}
                    style={{
                        padding: '10px 16px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '10px',
                        color: 'var(--accent-primary)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                    }}
                >
                    <Search size={14} />
                    {showingSamples ? 'Query Live Datastore' : 'View Sample Precedents'}
                </button>
            </div>

            {/* List of Cases */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeCasesToDisplay.map((c, i) => (
                    <div key={i} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '14px', border: '1px solid var(--glass-border)', transition: 'all 0.2s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FileText size={18} color="var(--accent-primary)" />
                                <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                    Case #{c.caseId}
                                </div>
                                {c.crimeType && (
                                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                        • {c.crimeType}
                                    </span>
                                )}
                            </div>

                            <div style={{ fontSize: '12px', padding: '4px 12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-success)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-success)' }} />
                                Match Score: {c.similarityScore}%
                            </div>
                        </div>

                        {c.matchDetails && (
                            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <ShieldCheck size={14} /> Pattern & Intersection Analysis:
                                </div>
                                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                    {c.matchDetails.crimeType && <li><strong style={{ color: 'var(--text-primary)' }}>Crime Category:</strong> {c.matchDetails.crimeType}</li>}
                                    {c.matchDetails.mo && <li><strong style={{ color: 'var(--text-primary)' }}>Modus Operandi (M.O.):</strong> {c.matchDetails.mo}</li>}
                                    {c.matchDetails.location && <li><strong style={{ color: 'var(--text-primary)' }}>Location / Precinct:</strong> {c.matchDetails.location}</li>}
                                    {c.matchDetails.temporal && <li><strong style={{ color: 'var(--text-primary)' }}>Temporal Proximity:</strong> {c.matchDetails.temporal}</li>}
                                    {c.matchDetails.sharedEntities && <li><strong style={{ color: 'var(--text-primary)' }}>Shared Entities:</strong> {c.matchDetails.sharedEntities}</li>}
                                </ul>
                            </div>
                        )}

                        {c.resolution && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--accent-success)', background: 'rgba(16, 185, 129, 0.08)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', lineHeight: '1.4' }}>
                                <CheckCircle2 size={18} flexShrink={0} />
                                <span><strong style={{ color: 'var(--text-primary)' }}>Precedent Resolution:</strong> {c.resolution}</span>
                            </div>
                        )}

                        <button 
                            onClick={() => navigate(`/cases/${c.caseId}`)} 
                            style={{ alignSelf: 'flex-start', padding: '8px 16px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', color: 'var(--accent-primary)', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', marginTop: '4px' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                            }}
                        >
                            Open Case Record <ArrowRight size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoricalIntelligencePanel;
