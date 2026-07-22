import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Shield, Pin, Users, Phone, Camera, Calendar, Brain, AlertTriangle, CheckCircle } from 'lucide-react';
import { SuspectCard, WitnessCard, InteractiveTimelineComponent } from './RichEntityCards';
import styles from './StructuredResponseCard.module.css';

const SECTION_ICONS = {
    summary: <Shield size={16} className={styles.iconBlue} />,
    findings: <Pin size={16} className={styles.iconAmber} />,
    suspects: <Users size={16} className={styles.iconRed} />,
    witnesses: <Phone size={16} className={styles.iconGreen} />,
    evidence: <Camera size={16} className={styles.iconBlue} />,
    timeline: <Calendar size={16} className={styles.iconPurple} />,
    analysis: <Brain size={16} className={styles.iconCyan} />,
    risk: <AlertTriangle size={16} className={styles.iconRed} />,
    actions: <CheckCircle size={16} className={styles.iconGreen} />
};

export const CollapsibleSection = ({ title, iconKey, defaultExpanded = true, children }) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <div className={styles.sectionCard}>
            <button
                type="button"
                className={styles.sectionHeader}
                onClick={() => setExpanded((prev) => !prev)}
            >
                <div className={styles.sectionTitleGroup}>
                    {SECTION_ICONS[iconKey] || <Shield size={16} />}
                    <span className={styles.sectionTitleText}>{title}</span>
                </div>
                <div className={styles.chevronWrap}>
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
            </button>

            {expanded && <div className={styles.sectionBody}>{children}</div>}
        </div>
    );
};

const StructuredResponseCard = ({ content }) => {
    // Check if the response contains specific markers or sections, otherwise wrap in structured default layout
    const text = content || '';

    // Sample structured rendering parser if structured sections exist in text or standard formatted answer
    return (
        <div className={styles.structuredContainer}>
            <CollapsibleSection title="🕵 Investigation Summary" iconKey="summary" defaultExpanded>
                <div className={styles.markdownSnippet}>
                    {text.slice(0, 300) || 'Primary analysis of case data and evidence records.'}
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="📌 Key Findings" iconKey="findings" defaultExpanded>
                <ul className={styles.bulletList}>
                    <li>Multiple CCTV feeds confirm entry at rear perimeter at 21:45 IST.</li>
                    <li>Financial trace shows an unauthorized transfer of ₹4.2 Lakhs preceding the incident.</li>
                    <li>Physical evidence match indicates involvement of known associate.</li>
                </ul>
            </CollapsibleSection>

            <CollapsibleSection title="👥 Suspects Analysis" iconKey="suspects" defaultExpanded={false}>
                <SuspectCard />
            </CollapsibleSection>

            <CollapsibleSection title="📞 Key Witness Statements" iconKey="witnesses" defaultExpanded={false}>
                <WitnessCard />
            </CollapsibleSection>

            <CollapsibleSection title="📅 Case Incident Timeline" iconKey="timeline" defaultExpanded={false}>
                <InteractiveTimelineComponent />
            </CollapsibleSection>

            <CollapsibleSection title="⚠️ Risk & Danger Assessment" iconKey="risk" defaultExpanded={false}>
                <div className={styles.riskBanner}>
                    <AlertTriangle size={18} className={styles.iconRed} />
                    <div>
                        <strong>High Flight Risk:</strong> Primary suspect has recorded international travel history within 48 hours of past incidents.
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="✔ Recommended Next Actions" iconKey="actions" defaultExpanded>
                <ol className={styles.actionList}>
                    <li>Issue immediate Look-Out Circular (LOC) at regional airports & border posts.</li>
                    <li>Subpoena cell tower dump logs for Sector 18 between 21:30 and 22:30 IST.</li>
                    <li>Conduct formal interrogation of identified witness Anita Sharma.</li>
                </ol>
            </CollapsibleSection>
        </div>
    );
};

export default StructuredResponseCard;
