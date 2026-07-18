import React from 'react';
import { FileSearch, Video, Users, Phone, Landmark, Clock, Paperclip, UserRound } from 'lucide-react';
import styles from './EvidenceCard.module.css';

const ICONS = {
    Case: FileSearch,
    Victim: UserRound,
    Suspect: Users,
    Witness: UserRound,
    CCTV: Video,
    PhoneRecord: Phone,
    FinancialTransaction: Landmark,
    TimelineEvent: Clock,
    Attachment: Paperclip
};

function describe(citation) {
    const d = citation.details;
    if (!d) return 'Details unavailable';
    switch (citation.type) {
        case 'CCTV':
            return [d.location, d.captured_at, d.confidence_score != null ? `${d.confidence_score}% confidence` : null].filter(Boolean).join(' · ');
        case 'Witness':
            return [d.name, d.reliability_score != null ? `${d.reliability_score}% reliability` : null].filter(Boolean).join(' · ');
        case 'Suspect':
            return [d.name, d.risk_level ? `${d.risk_level} risk` : null, d.status].filter(Boolean).join(' · ');
        case 'PhoneRecord':
            return [d.caller && d.receiver ? `${d.caller} → ${d.receiver}` : null, d.call_time].filter(Boolean).join(' · ');
        case 'FinancialTransaction':
            return [d.amount != null ? `Rs. ${d.amount}` : null, d.txn_type, d.is_flagged ? 'Flagged' : null].filter(Boolean).join(' · ');
        case 'TimelineEvent':
            return [d.title, d.event_time].filter(Boolean).join(' · ');
        case 'Attachment':
            return d.filename;
        default:
            return d.name || '';
    }
}

const EvidenceCard = ({ citation, onOpen, compact }) => {
    const Icon = ICONS[citation.type] || FileSearch;

    if (compact) {
        return (
            <button type="button" className={styles.chip} onClick={() => onOpen(citation)}>
                <Icon size={13} />
                <span>{citation.label}</span>
            </button>
        );
    }

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <Icon size={16} color="var(--accent-primary)" />
                <span className={styles.cardTitle}>{citation.label}</span>
            </div>
            <div className={styles.cardBody}>{describe(citation)}</div>
            <button type="button" className={styles.cardAction} onClick={() => onOpen(citation)}>
                Open Evidence
            </button>
        </div>
    );
};

export default EvidenceCard;
