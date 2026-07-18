import React, { useEffect, useRef } from 'react';
import { BrainCircuit } from 'lucide-react';
import ChatMessageBubble from './ChatMessageBubble';
import styles from './ChatMessageList.module.css';

const ChatMessageList = ({ messages, isStreaming, streamedText, onOpenEvidence, onFollowUp, onRegenerate }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages, streamedText]);

    let lastAssistantIndex = -1;
    for (let i = messages.length - 1; i >= 0; i -= 1) {
        if (messages[i].role === 'assistant') {
            lastAssistantIndex = i;
            break;
        }
    }

    if (messages.length === 0 && !isStreaming) {
        return (
            <div className={styles.empty}>
                <BrainCircuit size={40} color="var(--accent-primary)" />
                <h3>I've analyzed the current case.</h3>
                <p>Ask about the victim, timeline, evidence, witnesses, or suspects to get started.</p>
            </div>
        );
    }

    return (
        <div className={styles.list}>
            {messages.map((m, i) => (
                <ChatMessageBubble
                    key={m.id || i}
                    message={m}
                    isLast={i === lastAssistantIndex && !isStreaming}
                    onOpenEvidence={onOpenEvidence}
                    onFollowUp={onFollowUp}
                    onRegenerate={onRegenerate}
                />
            ))}

            {isStreaming && (
                <ChatMessageBubble
                    message={{ role: 'assistant', content: streamedText || '' }}
                    isLast={false}
                    onOpenEvidence={onOpenEvidence}
                    onFollowUp={onFollowUp}
                    onRegenerate={onRegenerate}
                    streaming
                />
            )}
            {isStreaming && !streamedText && (
                <div className={styles.thinking}>
                    <BrainCircuit size={16} />
                    <span>AI is thinking</span>
                    <span className={styles.dots}>
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                    </span>
                </div>
            )}
            <div ref={bottomRef} />
        </div>
    );
};

export default ChatMessageList;
