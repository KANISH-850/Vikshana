import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { motion } from 'framer-motion';
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, Check } from 'lucide-react';
import MermaidBlock from './MermaidBlock';
import EvidenceCard from './EvidenceCard';
import FollowUpChips from './FollowUpChips';
import 'highlight.js/styles/github-dark.css';
import styles from './ChatMessageBubble.module.css';

const CITATION_REGEX = /\[(Case|Victim|Suspect|Witness|CCTV|PhoneRecord|FinancialTransaction|TimelineEvent|Attachment)\s*#([\w-]+)\]/g;

function injectEvidenceLinks(text) {
    return text.replace(CITATION_REGEX, (full, type, id) => `[${type} #${id}](evidence://${type}/${id})`);
}

function CodeBlock({ inline, className, children }) {
    const langMatch = /language-(\w+)/.exec(className || '');
    const codeText = String(children).replace(/\n$/, '');
    if (!inline && langMatch && langMatch[1] === 'mermaid') {
        return <MermaidBlock chart={codeText} />;
    }
    if (inline) return <code className={className}>{children}</code>;
    return (
        <pre>
            <code className={className}>{children}</code>
        </pre>
    );
}

function parseMessageContent(content, streaming) {
    let text = content || '';
    if (streaming) {
        text += ' [cursor](cursor://)';
    }

    const thinkStart = text.indexOf('<think>');
    if (thinkStart === -1) {
        return { thinking: null, body: injectEvidenceLinks(text) };
    }

    const thinkEnd = text.indexOf('</think>');
    if (thinkEnd !== -1) {
        const thinking = text.slice(thinkStart + 7, thinkEnd).trim();
        const body = text.slice(thinkEnd + 8).trim();
        return {
            thinking,
            body: injectEvidenceLinks(body),
            isThinkingComplete: true
        };
    } else {
        const thinking = text.slice(thinkStart + 7).trim();
        return {
            thinking,
            body: '',
            isThinkingComplete: false
        };
    }
}

function ReasoningBlock({ content, isComplete }) {
    const [expanded, setExpanded] = useState(!isComplete);

    return (
        <div className={styles.thinkingContainer}>
            <button
                type="button"
                className={styles.thinkingHeader}
                onClick={() => setExpanded(!expanded)}
            >
                <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-tertiary)'
                }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                    </svg>
                </div>
                <span>{isComplete ? 'Thought Process' : 'Thinking...'}</span>
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                        transform: expanded ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease',
                    }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            {expanded && (
                <div className={styles.thinkingBody}>
                    {content}
                </div>
            )}
        </div>
    );
}

const ChatMessageBubble = ({ message, onOpenEvidence, onFollowUp, onRegenerate, isLast, streaming }) => {
    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const isUser = message.role === 'user';

    const { thinking, body, isThinkingComplete } = useMemo(() => {
        return parseMessageContent(message.content, streaming);
    }, [message.content, streaming]);

    function LinkRenderer({ href, children }) {
        if (href === 'cursor://') {
            return <span className="vik-streaming-cursor" />;
        }
        if (href && href.startsWith('evidence://')) {
            const match = href.match(/^evidence:\/\/([^/]+)\/(.+)$/);
            const [, type, id] = match || [];
            const citation = (message.citations || []).find((c) => c.type === type && String(c.refId) === id) || {
                type,
                refId: id,
                label: `${type} #${id}`
            };
            return (
                <a
                    href="#evidence"
                    className="vik-evidence-link"
                    onClick={(e) => {
                        e.preventDefault();
                        onOpenEvidence(citation);
                    }}
                >
                    {children}
                </a>
            );
        }
        return (
            <a href={href} target="_blank" rel="noreferrer">
                {children}
            </a>
        );
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`${styles.row} ${isUser ? styles.rowUser : styles.rowAssistant}`}
        >
            <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}>
                {isUser ? (
                    <div className={styles.userText}>{message.content}</div>
                ) : (
                    <div className="vik-markdown">
                        {thinking && (
                            <ReasoningBlock content={thinking} isComplete={isThinkingComplete} />
                        )}
                        {body && (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                                components={{ code: CodeBlock, a: LinkRenderer }}
                            >
                                {body}
                            </ReactMarkdown>
                        )}
                    </div>
                )}

                {!isUser && !streaming && message.citations && message.citations.length > 0 && (
                    <div className={styles.evidenceRow}>
                        {message.citations.map((c, i) => (
                            <EvidenceCard key={i} citation={c} onOpen={onOpenEvidence} compact />
                        ))}
                    </div>
                )}

                {!isUser && !streaming && (
                    <div className={styles.actions}>
                        <button type="button" className={styles.actionBtn} onClick={handleCopy} title="Copy">
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        <button
                            type="button"
                            className={`${styles.actionBtn} ${feedback === 'up' ? styles.active : ''}`}
                            onClick={() => setFeedback('up')}
                            title="Good response"
                        >
                            <ThumbsUp size={14} />
                        </button>
                        <button
                            type="button"
                            className={`${styles.actionBtn} ${feedback === 'down' ? styles.active : ''}`}
                            onClick={() => setFeedback('down')}
                            title="Bad response"
                        >
                            <ThumbsDown size={14} />
                        </button>
                        {isLast && (
                            <button type="button" className={styles.actionBtn} onClick={onRegenerate} title="Regenerate">
                                <RotateCcw size={14} />
                            </button>
                        )}
                        <span className={styles.timestamp}>
                            {message.createdAt
                                ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : ''}
                        </span>
                    </div>
                )}

                {!isUser && !streaming && isLast && message.suggestions && message.suggestions.length > 0 && (
                    <FollowUpChips suggestions={message.suggestions} onSelect={onFollowUp} />
                )}
            </div>
        </motion.div>
    );
};

export default ChatMessageBubble;
