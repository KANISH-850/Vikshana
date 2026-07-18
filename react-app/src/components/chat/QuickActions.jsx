import React from 'react';
import { QUICK_ACTIONS } from '../../utils/slashCommands';
import styles from './QuickActions.module.css';

const QuickActions = ({ onRun }) => (
    <div className={styles.row}>
        {QUICK_ACTIONS.map((qa) => (
            <button key={qa.label} type="button" className={styles.chip} onClick={() => onRun(qa)}>
                {qa.label}
            </button>
        ))}
    </div>
);

export default QuickActions;
