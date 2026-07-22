import React from 'react';
import { Shield, FileSearch, AlertCircle, UserCheck, MessageSquare, ArrowUpRight } from 'lucide-react';
import styles from './SuggestedPrompts.module.css';

const STARTER_PROMPTS = [
    {
        title: 'Analyze Case FIR',
        desc: 'Extract key charges, suspect names, timestamps, and incident location.',
        icon: <FileSearch size={20} color="#2563EB" />,
        prompt: 'Analyze this FIR and break down the primary charges, accused parties, and incident details.'
    },
    {
        title: 'Find Contradictions',
        desc: 'Cross-check witness testimonies against CCTV coverage and alibis.',
        icon: <AlertCircle size={20} color="#2563EB" />,
        prompt: 'Find contradictions between witness statements, suspect alibis, and physical evidence.'
    },
    {
        title: 'Generate Suspect Profile',
        desc: 'Build risk scores, known criminal history, and associate maps.',
        icon: <UserCheck size={20} color="#2563EB" />,
        prompt: 'Generate a detailed suspect profile including risk score, known associates, and past offenses.'
    },
    {
        title: 'Summarize Witness Logs',
        desc: 'Highlight critical observations and evaluate statement reliability.',
        icon: <MessageSquare size={20} color="#2563EB" />,
        prompt: 'Summarize all witness statements and highlight key observations and credibility scores.'
    }
];

const SuggestedPrompts = ({ onSelect }) => {
    return (
        <div className={styles.container}>
            <div className={styles.heroSection}>
                <div className={styles.logoBadge}>
                    <Shield size={24} color="#2563EB" />
                </div>
                <h2 className={styles.heroTitle}>Vikshana AI Detective</h2>
                <p className={styles.heroSubtitle}>
                    Select an investigation workflow card below or type your inquiry to begin.
                </p>
            </div>

            <div className={styles.grid}>
                {STARTER_PROMPTS.map((card, idx) => (
                    <div
                        key={idx}
                        className={styles.starterCard}
                        onClick={() => onSelect(card.prompt)}
                    >
                        <div className={styles.cardHeader}>
                            <div className={styles.iconWrap}>{card.icon}</div>
                            <ArrowUpRight size={16} className={styles.arrowIcon} />
                        </div>
                        <h4 className={styles.cardTitle}>{card.title}</h4>
                        <p className={styles.cardDesc}>{card.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuggestedPrompts;
