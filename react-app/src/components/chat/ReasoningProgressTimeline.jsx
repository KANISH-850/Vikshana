import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import styles from './ReasoningProgressTimeline.module.css';

const DEFAULT_STEPS = [
    { title: 'Reading FIR & Input Data', status: 'completed' },
    { title: 'Extracting Key Entities & Relationships', status: 'completed' },
    { title: 'Analyzing Case Timeline & Alibis', status: 'completed' },
    { title: 'Cross-checking Witness & Physical Evidence', status: 'completed' },
    { title: 'Generating Investigative Insights & Next Steps', status: 'in-progress' }
];

const ReasoningProgressTimeline = ({ thinkingContent, isComplete }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [steps, setSteps] = useState(DEFAULT_STEPS);

    useEffect(() => {
        if (isComplete) {
            setSteps((prev) =>
                prev.map((s) => ({ ...s, status: 'completed' }))
            );
        }
    }, [isComplete]);

    return (
        <div className={styles.container}>
            <button
                type="button"
                className={styles.header}
                onClick={() => setCollapsed((prev) => !prev)}
            >
                <div className={styles.headerTitle}>
                    <div className={styles.sparkleWrap}>
                        <Sparkles size={13} className={styles.sparkleIcon} />
                    </div>
                    <span>{isComplete ? 'Investigative Reasoning Complete' : 'Vikshana Detective Thinking...'}</span>
                </div>
                <div className={styles.headerRight}>
                    <span className={styles.statusBadge}>
                        {isComplete ? '5/5 Steps Done' : 'Analyzing Case Data'}
                    </span>
                    {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </div>
            </button>

            {!collapsed && (
                <div className={styles.body}>
                    <div className={styles.timeline}>
                        {steps.map((step, index) => {
                            const isDone = isComplete || step.status === 'completed';
                            const isInProgress = !isComplete && step.status === 'in-progress';
                            return (
                                <div key={index} className={styles.stepRow}>
                                    <div className={styles.stepIconWrap}>
                                        {isDone ? (
                                            <CheckCircle2 size={16} className={styles.checkIcon} />
                                        ) : isInProgress ? (
                                            <Loader2 size={16} className={styles.spinIcon} />
                                        ) : (
                                            <div className={styles.pendingDot} />
                                        )}
                                        {index < steps.length - 1 && <div className={`${styles.line} ${isDone ? styles.lineDone : ''}`} />}
                                    </div>
                                    <div className={styles.stepContent}>
                                        <div className={`${styles.stepTitle} ${isDone ? styles.doneText : isInProgress ? styles.activeText : ''}`}>
                                            Step {index + 1}: {step.title}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {thinkingContent && (
                        <div className={styles.rawThinking}>
                            <div className={styles.rawThinkingLabel}>Detailed Thought Trace:</div>
                            <pre className={styles.rawThinkingContent}>{thinkingContent}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReasoningProgressTimeline;
