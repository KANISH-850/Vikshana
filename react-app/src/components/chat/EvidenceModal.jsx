import React from 'react';
import { X } from 'lucide-react';
import styles from './EvidenceModal.module.css';

const EvidenceModal = ({ citation, onClose }) => {
    if (!citation) return null;
    const details = citation.details || {};
    const entries = Object.entries(details).filter(([key]) => key !== 'ROWID');

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>{citation.label}</h3>
                    <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>
                <div className={styles.body}>
                    {entries.length === 0 ? (
                        <p className={styles.empty}>No further details were retrieved for this citation.</p>
                    ) : (
                        <dl className={styles.detailList}>
                            {entries.map(([key, value]) => (
                                <React.Fragment key={key}>
                                    <dt>{key.replace(/_/g, ' ')}</dt>
                                    <dd>{String(value)}</dd>
                                </React.Fragment>
                            ))}
                        </dl>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EvidenceModal;
