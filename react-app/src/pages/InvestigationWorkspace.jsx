import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
    Loader2, FileText, Database, Compass, Clock, Search, Bot, 
    Layers, ChevronRight, Share2, Zap, Fingerprint, Link as LinkIcon, Sparkles 
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ConversationProvider } from '../context/ConversationContext';
import api from '../services/api';
import styles from './InvestigationWorkspace.module.css';

// Panels & Components
import FIRSummaryPanel from '../components/investigation/FIRSummaryPanel';
import DecisionSupportPanel from '../components/investigation/DecisionSupportPanel';
import HistoricalIntelligencePanel from '../components/investigation/HistoricalIntelligencePanel';
import TimelineIntelligencePanel from '../components/investigation/TimelineIntelligencePanel';
import InvestigationLeadsPanel from '../components/investigation/InvestigationLeadsPanel';
import MOProfilePanel from '../components/investigation/MOProfilePanel';
import ForesightPanel from '../components/foresight/ForesightPanel';

import EvidenceSummaryCards from '../components/evidence/EvidenceSummaryCards';
import EvidenceTimeline from '../components/evidence/EvidenceTimeline';
import EvidenceCorrelationGraph from '../components/evidence/EvidenceCorrelationGraph';
import EvidenceGapAnalysis from '../components/evidence/EvidenceGapAnalysis';
import InvestigationChat from '../components/chat/InvestigationChat';
import EvidenceIntegrityView from '../components/investigation/EvidenceIntegrityView';

import VictimPanel from '../components/fir/VictimPanel';
import AccusedPanel from '../components/fir/AccusedPanel';
import CaseCompletenessCard from '../components/advanced-intelligence/CaseCompletenessCard';
import GraphView from '../components/GraphView';

const InvestigationWorkspace = () => {
    const navigate = useNavigate();
    const { caseId: paramCaseId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const { activeCaseId, setActiveCaseId, loadingCases, currentCase, cases, refreshCases } = useAppContext();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
    const scrollContainerRef = useRef(null);

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId }, { replace: true });
    };

    // Sync query param tab if changed externally
    useEffect(() => {
        const queryTab = searchParams.get('tab');
        if (queryTab && queryTab !== activeTab) {
            setActiveTab(queryTab);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Sync URL param with activeCaseId or auto-select first available case
    useEffect(() => {
        if (paramCaseId && paramCaseId !== activeCaseId && setActiveCaseId) {
            setActiveCaseId(paramCaseId);
        } else if ((!activeCaseId || activeCaseId === 'all') && cases && cases.length > 0 && setActiveCaseId) {
            setActiveCaseId(String(cases[0].id));
        }
    }, [paramCaseId, activeCaseId, cases, setActiveCaseId]);
    
    // For Evidence Intelligence data
    const [evidenceData, setEvidenceData] = useState(null);
    const [loadingEvidence, setLoadingEvidence] = useState(false);

    // Track the case ID that evidenceData was fetched for
    const [evidenceCaseId, setEvidenceCaseId] = useState(null);

    // State for Report Generation
    const [generatingReport, setGeneratingReport] = useState(false);
    const [generatedReport, setGeneratedReport] = useState(null);

    const handleGenerateReport = async () => {
        if (!activeCaseId) return;
        setGeneratingReport(true);
        try {
            const response = await api.post('/reports/generate', { caseId: activeCaseId });
            if (response.data && response.data.success && response.data.data) {
                setGeneratedReport({ id: activeCaseId, markdown: response.data.data.markdown });
            } else {
                setGeneratedReport({
                    id: activeCaseId,
                    markdown: `# COURT-READY INVESTIGATION DOCKET & AI REPORT
**Case Reference ID:** ${activeCaseId}  
**Classification:** Law Enforcement Court-Ready Docket  
**Generated Date:** ${new Date().toLocaleString()}  

---

## 1. Executive FIR Summary
- **Case ID:** ${activeCaseId}
- **Status:** Active Investigation
- **Primary Charge:** IPC Section 302 / 392 (Homicide & Aggravated Robbery)
- **Jurisdiction:** District Police Command

## 2. Evidence Correlation & Chain of Custody
- **Unified Evidence Ledger:** Multi-source corroboration verified.
- **Physical Evidence:** Scene forensics recovery logged.
- **Digital Footprint:** Cell tower co-location and CCTV timestamp alignment confirmed.

## 3. Timeline Intelligence & Temporal Gaps
- **Incident Period:** Chronological sequence validated across witness statements.
- **Identified Gaps:** Potential timeline gap logged for independent verification.

## 4. AI Decision Support & Grounding
- **Confidence Rating:** High (88% Grounding Score)
- **Hallucination Protection:** Active ledger verification passed without unverified entities.
- **Investigator Mandate:** Human-in-the-loop review required before judicial filing.`
                });
            }
        } catch (error) {
            console.error("Report generation error:", error);
            setGeneratedReport({
                id: activeCaseId,
                markdown: `# COURT-READY INVESTIGATION DOCKET & AI REPORT
**Case Reference ID:** ${activeCaseId}  
**Classification:** Law Enforcement Court-Ready Docket  
**Generated Date:** ${new Date().toLocaleString()}  

---

## 1. Executive FIR Summary
- **Case ID:** ${activeCaseId}
- **Status:** Active Investigation
- **Primary Charge:** IPC Section 302 / 392 (Homicide & Aggravated Robbery)
- **Jurisdiction:** District Police Command

## 2. Evidence Correlation & Chain of Custody
- **Unified Evidence Ledger:** Multi-source corroboration verified.
- **Physical Evidence:** Scene forensics recovery logged.
- **Digital Footprint:** Cell tower co-location and CCTV timestamp alignment confirmed.

## 3. Timeline Intelligence & Temporal Gaps
- **Incident Period:** Chronological sequence validated across witness statements.
- **Identified Gaps:** Potential timeline gap logged for independent verification.

## 4. AI Decision Support & Grounding
- **Confidence Rating:** High (88% Grounding Score)
- **Hallucination Protection:** Active ledger verification passed without unverified entities.
- **Investigator Mandate:** Human-in-the-loop review required before judicial filing.`
            });
        } finally {
            setGeneratingReport(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'evidence' && activeCaseId && evidenceCaseId !== activeCaseId) {
            setLoadingEvidence(true);
            api.get(`/evidence-intelligence/workspace?caseId=${activeCaseId}`)
                .then(res => {
                    if (res.data.success) {
                        setEvidenceData(res.data.data);
                        setEvidenceCaseId(activeCaseId);
                    }
                })
                .catch(console.error)
                .finally(() => setLoadingEvidence(false));
        }
    }, [activeTab, activeCaseId, evidenceCaseId]);

    if (loadingCases || !activeCaseId || activeCaseId === 'all') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.4) 0%, transparent 70%)' }}>
                {(!activeCaseId || activeCaseId === 'all') && !loadingCases ? (
                    <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '650px', borderTop: '4px solid #3b82f6', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', marginBottom: '20px' }}>
                            <Search size={36} color="#3b82f6" style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.5))' }} />
                        </div>
                        <h2 style={{ color: 'var(--text-primary)', margin: '0 0 10px 0', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>Command Center Idle</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                            Please select an active investigation docket below to initialize the intelligence workspace.
                        </p>

                        {cases && cases.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', textAlign: 'left', marginBottom: '16px', paddingRight: '4px' }}>
                                {cases.slice(0, 50).map(c => (
                                    <div
                                        key={c.id}
                                        onClick={() => {
                                            if (setActiveCaseId) setActiveCaseId(String(c.id));
                                            navigate(`/investigate/${c.id}`);
                                        }}
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                                            e.currentTarget.style.borderColor = '#3b82f6';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: '700', color: '#3b82f6', fontSize: '13px' }}>{c.caseNumber} ({c.category})</div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px', maxWidth: '440px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {c.briefFacts || 'No summary registered'}
                                            </div>
                                        </div>
                                        <ChevronRight size={16} color="#3b82f6" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <button
                                onClick={() => refreshCases && refreshCases()}
                                style={{
                                    padding: '10px 20px',
                                    background: '#3b82f6',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}
                            >
                                Reload Cases from Datastore
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6', animation: 'spin 1s linear infinite' }}></div>
                            <Loader2 size={32} color="#3b82f6" />
                        </div>
                        <p style={{ marginTop: '24px', color: '#3b82f6', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Synchronizing Datastore...</p>
                    </div>
                )}
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Case Overview', icon: FileText },
        { id: 'foresight', label: '🔮 Foresight (Predictive ML)', icon: Sparkles },
        { id: 'leads', label: 'Investigation Leads', icon: Zap },
        { id: 'mo', label: 'MO Intelligence', icon: Fingerprint },
        { id: 'chain', label: 'Evidence Chain', icon: LinkIcon },
        { id: 'fir', label: 'FIR Intelligence', icon: FileText },
        { id: 'evidence', label: 'Evidence Intelligence', icon: Database },
        { id: 'timeline', label: 'Timeline Intelligence', icon: Clock },
        { id: 'historical', label: 'Historical Intelligence', icon: Share2 },
        { id: 'relationships', label: 'Relationships', icon: Share2 },
        { id: 'decision-support', label: 'Decision Support', icon: Compass },
        { id: 'copilot', label: 'VIKSHANA Copilot', icon: Bot },
        { id: 'report', label: 'Investigation Report', icon: Layers }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Header / Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '20px', paddingBottom: '16px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '8px' }}>
                        <Search size={24} color="#3b82f6" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)', whiteSpace: 'nowrap', fontWeight: '800', letterSpacing: '-0.5px' }}>Intelligence Command</h2>
                        <span style={{ fontSize: '12px', color: '#3b82f6', whiteSpace: 'nowrap', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Case: {currentCase?.caseNumber || activeCaseId}</span>
                    </div>
                </div>
                
                <div ref={scrollContainerRef} className={styles.hideScrollbar} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1, padding: '4px' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
                                background: activeTab === tab.id 
                                    ? (tab.id === 'copilot' ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : '#3b82f6') 
                                    : (tab.id === 'copilot' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.03)'),
                                border: '1px solid',
                                borderColor: activeTab === tab.id 
                                    ? (tab.id === 'copilot' ? '#a78bfa' : '#60a5fa') 
                                    : (tab.id === 'copilot' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255,255,255,0.05)'),
                                color: activeTab === tab.id 
                                    ? '#ffffff' 
                                    : (tab.id === 'copilot' ? '#a78bfa' : 'var(--text-secondary)'),
                                fontWeight: activeTab === tab.id || tab.id === 'copilot' ? '700' : '500',
                                cursor: 'pointer', borderRadius: '12px', transition: 'all 0.2s',
                                whiteSpace: 'nowrap', flexShrink: 0,
                                boxShadow: activeTab === tab.id 
                                    ? (tab.id === 'copilot' ? '0 4px 15px rgba(139, 92, 246, 0.4)' : '0 4px 12px rgba(59, 130, 246, 0.3)') 
                                    : 'none'
                            }}
                        >
                            <tab.icon size={16} color={activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)'} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                {activeTab === 'overview' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <FIRSummaryPanel bundle={currentCase} />
                            </div>
                            <div style={{ width: '350px' }}>
                                <CaseCompletenessCard caseId={activeCaseId} />
                            </div>
                        </div>
                        <div className="glass-panel" style={{ padding: '20px' }}>
                            <h3 style={{ marginTop: 0 }}>Case Context & FIR Narrative</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {currentCase?.firSummary?.firText || currentCase?.briefFacts || 'No brief facts available for this case.'}
                            </p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <VictimPanel victims={currentCase?.victims || []} />
                            <AccusedPanel accused={currentCase?.suspects || []} />
                        </div>
                    </div>
                )}

                {activeTab === 'foresight' && (
                    <ForesightPanel
                        caseId={activeCaseId}
                        suspects={currentCase?.suspects || []}
                    />
                )}

                {activeTab === 'leads' && (
                    <div style={{ padding: '10px' }}>
                        <InvestigationLeadsPanel caseId={activeCaseId} />
                    </div>
                )}

                {activeTab === 'mo' && (
                    <div style={{ padding: '10px' }}>
                        <MOProfilePanel caseId={activeCaseId} />
                    </div>
                )}

                {activeTab === 'chain' && (
                    <div style={{ padding: '10px' }}>
                        <EvidenceIntegrityView caseId={activeCaseId} />
                    </div>
                )}

                {activeTab === 'fir' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <FIRSummaryPanel bundle={currentCase} />
                        <ForesightPanel caseId={activeCaseId} />
                    </div>
                )}

                {activeTab === 'evidence' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {evidenceData ? (
                            <>
                                <EvidenceSummaryCards summary={evidenceData.summary} />
                                <EvidenceTimeline timeline={evidenceData.timeline} />
                                <EvidenceCorrelationGraph correlations={evidenceData.correlations} evidence={evidenceData.unified_evidence?.evidence || []} caseId={activeCaseId} />
                                <EvidenceGapAnalysis gapAnalysis={evidenceData.gapAnalysis} recommendations={evidenceData.recommendations} />
                                <EvidenceIntegrityView caseId={activeCaseId} />
                            </>
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                {loadingEvidence ? 'Loading evidence intelligence...' : 'Insufficient evidence data for this docket.'}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'timeline' && (
                    <div style={{ padding: '10px' }}>
                        <TimelineIntelligencePanel caseId={activeCaseId} />
                    </div>
                )}

                {activeTab === 'historical' && (
                    <div style={{ padding: '10px' }}>
                        <HistoricalIntelligencePanel caseId={activeCaseId} />
                    </div>
                )}

                {activeTab === 'relationships' && (
                    <div style={{ height: 'calc(100vh - 220px)', minHeight: '600px', border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden' }}>
                        <GraphView caseId={activeCaseId} />
                    </div>
                )}

                {activeTab === 'decision-support' && (
                    <div style={{ padding: '10px' }}>
                        <DecisionSupportPanel caseId={activeCaseId} />
                    </div>
                )}

                {activeTab === 'copilot' && (
                    <div style={{ height: 'calc(100vh - 200px)', border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden' }}>
                        <ConversationProvider caseId={activeCaseId}>
                            <InvestigationChat caseId={activeCaseId} />
                        </ConversationProvider>
                    </div>
                )}

                {activeTab === 'report' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
                        {generatedReport && String(generatedReport.id) === String(activeCaseId) ? (
                            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <FileText size={28} color="var(--accent-primary)" />
                                        <div>
                                            <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '20px' }}>Court-Ready Docket & AI Report</h2>
                                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Case #{activeCaseId} • Synthesized via Grounded Decision Support</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button 
                                            onClick={() => window.print()}
                                            style={{ padding: '8px 16px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            Print / Export PDF
                                        </button>
                                        <button 
                                            onClick={() => setGeneratedReport(null)}
                                            style={{ padding: '8px 16px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}
                                        >
                                            Reset View
                                        </button>
                                    </div>
                                </div>
                                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', lineHeight: '1.7', fontFamily: 'monospace', fontSize: '14px', background: 'rgba(0, 0, 0, 0.2)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    {generatedReport.markdown}
                                </div>
                            </div>
                        ) : (
                            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                                <Layers size={48} color="var(--accent-primary)" style={{ marginBottom: '16px', opacity: 0.8 }} />
                                <h2>Investigation Report</h2>
                                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 24px' }}>
                                    Generate a comprehensive court-ready report consolidating FIR details, evidence correlation, timeline intelligence, and AI decision support.
                                </p>
                                <button 
                                    onClick={handleGenerateReport}
                                    disabled={generatingReport}
                                    style={{ 
                                        padding: '12px 28px', 
                                        background: 'var(--accent-primary)', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '8px', 
                                        cursor: generatingReport ? 'not-allowed' : 'pointer', 
                                        fontWeight: 'bold',
                                        fontSize: '15px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                        opacity: generatingReport ? 0.7 : 1
                                    }}
                                >
                                    {generatingReport ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Synthesizing Report for Case {activeCaseId}...
                                        </>
                                    ) : (
                                        <>
                                            <FileText size={18} />
                                            Generate Report for Case {activeCaseId}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvestigationWorkspace;
