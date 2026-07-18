import React from 'react';
import { Sparkles } from 'lucide-react';
import styles from './FollowUpChips.module.css';

const FollowUpChips = ({ suggestions, onSelect }) => {
    if (!suggestions || suggestions.length === 0) return null;
    return (
        <div className={styles.wrap}>
            {suggestions.map((s, i) => (
                <button key={i} type="button" className={styles.chip} onClick={() => onSelect(s)}>
                    <Sparkles size={12} />
                    {s}
                </button>
            ))}
        </div>
    );
};

export default FollowUpChips;
