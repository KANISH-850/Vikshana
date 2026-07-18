import React, { useEffect, useState, useCallback } from 'react';
import {
    PanelRightClose,
    PanelRightOpen,
    Gauge,
    AlertTriangle,
    ShieldCheck,
    Clock,
    Users,
    UserRound,
    Paperclip,
    Pin
} from 'lucide-react';
import * as conversationService from '../../services/conversationService';
import styles from './ContextPanel.module.css';

const RISK_COLORS = { low: 'var(--accent-success)', medium: 'var(--accent-warning)', high: 'var(--accent-danger)' };

const ContextPanel = ({ caseId, collapsed, onToggle, refreshKey }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        if (!caseId) return;
        setLoading(true);
        try {
            const data = await conversationService.getCaseSummary(caseId);
            setSummary(data);
        } catch (err) {
            console.error('Failed to load case summary', err);
        } finally {
            setLoading(false);
        }
    }, [caseId]);

    useEffect(() => {
        load();
    }, [load, refreshKey]);

    if (collapsed) {
        return (
            <button type="button" className={styles.collapsedRail} onClick={onToggle} title="Show case context">
                <PanelRightOpen size={18} />
            </button>
        );
    }

    return (
        <aside className={styles.panel}>
            <div className={styles.header}>
                <h3>Case Context</h3>
                <button type="button" className={styles.collapseBtn} onClick={onToggle} title="Hide">
                    <PanelRightClose size={18} />
                </button>
            </div>

            {loading && !summary && <div className={styles.loading}>Loading case context...</div>}

            {summary && (
                <div className={styles.body}>
                    <section className={styles.section}>
                        <div className={styles.caseHeader}>
                            <span className={styles.caseId}>FIR #{summary.case && summary.case.ROWID}</span>
                            <span className={styles.statusBadge}>{(summary.case && summary.case.Status) || 'Unknown'}</span>
                        </div>
                        <div className={styles.metaRow}>{(summary.case && summary.case.Jurisdiction) || 'Unknown jurisdiction'}</div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.statRow}>
                            <div className={styles.statBox}>
                                <Gauge size={16} color="var(--accent-success)" />
                                <div>
                                    <div className={styles.statValue}>{summary.confidence}%</div>
                                    <div className={styles.statLabel}>AI Confidence</div>
                                </div>
                            </div>
                            <div className={styles.statBox}>
                                <AlertTriangle size={16} color={RISK_COLORS[summary.riskLevel] || 'var(--accent-warning)'} />
                                <div>
                                    <div className={styles.statValue} style={{ textTransform: 'capitalize' }}>{summary.riskLevel}</div>
                                    <div className={styles.statLabel}>Risk Level</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h4><UserRound size={13} /> Victims</h4>
                        {summary.victims && summary.victims.length ? (
                            summary.victims.map((v, i) => (
                                <div key={i} className={styles.rowItem}>{v.name || v.Name || `Victim #${v.ROWID}`}</div>
                            ))
                        ) : (
                            <div className={styles.emptyHint}>None on record.</div>
                        )}
                    </section>

                    <section className={styles.section}>
                        <h4><Users size={13} /> Suspects ({(summary.suspects && summary.suspects.length) || 0})</h4>
                        {summary.suspects && summary.suspects.length ? (
                            summary.suspects.map((s) => (
                                <div key={s.ROWID} className={styles.rowItem}>
                                    {s.name} <span className={styles.tag}>{s.risk_level}</span>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyHint}>None on record.</div>
                        )}
                    </section>

                    <section className={styles.section}>
                        <h4><Clock size={13} /> Timeline</h4>
                        {summary.timeline && summary.timeline.length ? (
                            summary.timeline.slice(0, 6).map((t) => (
                                <div key={t.ROWID} className={styles.timelineItem}>
                                    <span className={styles.timelineDot} />
                                    <div>
                                        <div className={styles.rowItem}>{t.title}</div>
                                        <div className={styles.timelineTime}>{t.event_time}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyHint}>No timeline events yet.</div>
                        )}
                    </section>

                    <section className={styles.section}>
                        <h4><ShieldCheck size={13} /> Evidence on file</h4>
                        <div className={styles.evidenceGrid}>
                            {Object.entries(summary.evidenceCounts || {}).map(([k, v]) => (
                                <div key={k} className={styles.evidencePill}>
                                    <span>{v}</span> {k.replace(/([A-Z])/g, ' $1')}
                                </div>
                            ))}
                        </div>
                    </section>

                    {summary.pinnedFacts && summary.pinnedFacts.length > 0 && (
                        <section className={styles.section}>
                            <h4><Pin size={13} /> Recent Findings</h4>
                            {summary.pinnedFacts.map((p, i) => (
                                <div key={i} className={styles.rowItem}>{p.content}</div>
                            ))}
                        </section>
                    )}

                    {summary.recentAttachments && summary.recentAttachments.length > 0 && (
                        <section className={styles.section}>
                            <h4><Paperclip size={13} /> Recent Uploads</h4>
                            {summary.recentAttachments.map((a) => (
                                <div key={a.ROWID} className={styles.rowItem}>{a.filename}</div>
                            ))}
                        </section>
                    )}
                </div>
            )}
        </aside>
    );
};

export default ContextPanel;
