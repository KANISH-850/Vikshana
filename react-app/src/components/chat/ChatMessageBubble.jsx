import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { motion } from 'framer-motion';
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, Check, Sparkles, Shield, AlertTriangle } from 'lucide-react';
import MermaidBlock from './MermaidBlock';
import EvidenceCard from './EvidenceCard';
import FollowUpChips from './FollowUpChips';
import ReasoningProgressTimeline from './ReasoningProgressTimeline';
import StructuredResponseCard from './StructuredResponseCard';
import 'highlight.js/styles/github.css';
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
        return { thinking: null, body: injectEvidenceLinks(text), isThinkingComplete: true };
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

const ChatMessageBubble = ({ message, onOpenEvidence, onFollowUp, onRegenerate, isLast, streaming, error }) => {
    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const isUser = message.role === 'user';

    const { thinking, body, isThinkingComplete } = useMemo(() => {
        return parseMessageContent(message.content, streaming);
    }, [message.content, streaming]);

    const isStructuredContent = useMemo(() => {
        if (isUser || !body) return false;
        return (
            body.includes('Investigation Summary') ||
            body.includes('Key Findings') ||
            body.includes('Suspects') ||
            body.includes('Recommended Next Actions')
        );
    }, [isUser, body]);

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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`${styles.row} ${isUser ? styles.rowUser : styles.rowAssistant}`}
        >
            {!isUser && (
                <div className={styles.avatarAssistant}>
                    <Shield size={16} color="#FFFFFF" />
                </div>
            )}

            <div className={`${styles.bubbleContainer} ${isUser ? styles.userContainer : styles.assistantContainer}`}>
                {/* User Message: Right-aligned light blue bubble */}
                {isUser ? (
                    <div className={styles.bubbleUser}>
                        <div className={styles.userText}>{message.content}</div>
                    </div>
                ) : (
                    /* Assistant Message: Left-aligned white card with soft shadow */
                    <div className={styles.bubbleAssistant}>
                        <div className={styles.assistantHeader}>
                            <div className={styles.botBadge}>
                                <Sparkles size={14} color="#2563EB" />
                                <span>Vikshana AI Detective</span>
                            </div>
                            <span className={styles.timestamp}>
                                {message.createdAt
                                    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : ''}
                            </span>
                        </div>

                        {/* Subtle Thinking/Investigating Indicator when waiting for stream start */}
                        {streaming && !body && !thinking && (
                            <div className={styles.investigatingIndicator}>
                                <div className={styles.pulsingDot} />
                                <span>Investigating case evidence…</span>
                            </div>
                        )}

                        {/* Reasoning Progress Timeline */}
                        {(thinking || (streaming && body)) && (
                            <ReasoningProgressTimeline
                                thinkingContent={thinking}
                                isComplete={isThinkingComplete && !streaming}
                            />
                        )}

                        {/* Markdown / Structured Body */}
                        {body && (
                            <div className="vik-markdown">
                                {isStructuredContent ? (
                                    <StructuredResponseCard content={body} />
                                ) : (
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

                        {/* Inline Danger Error Banner */}
                        {error && (
                            <div className={styles.inlineErrorBanner}>
                                <AlertTriangle size={15} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Evidence Citations */}
                        {!streaming && message.citations && message.citations.length > 0 && (
                            <div className={styles.evidenceRow}>
                                <div className={styles.evidenceLabel}>Cited Evidence:</div>
                                <div className={styles.evidenceGrid}>
                                    {message.citations.map((c, i) => (
                                        <EvidenceCard key={i} citation={c} onOpen={onOpenEvidence} compact />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Hover Action Toolbar */}
                        {!streaming && (
                            <div className={styles.actionsBar}>
                                <button type="button" className={styles.actionBtn} onClick={handleCopy} title="Copy response">
                                    {copied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                                    <span>{copied ? 'Copied' : 'Copy'}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.actionBtn} ${feedback === 'up' ? styles.active : ''}`}
                                    onClick={() => setFeedback('up')}
                                    title="Helpful response"
                                >
                                    <ThumbsUp size={13} />
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.actionBtn} ${feedback === 'down' ? styles.active : ''}`}
                                    onClick={() => setFeedback('down')}
                                    title="Unhelpful response"
                                >
                                    <ThumbsDown size={13} />
                                </button>
                                {isLast && (
                                    <button type="button" className={styles.actionBtn} onClick={onRegenerate} title="Regenerate analysis">
                                        <RotateCcw size={13} />
                                        <span>Regenerate</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Follow-up Suggestions */}
                        {!streaming && isLast && message.suggestions && message.suggestions.length > 0 && (
                            <FollowUpChips suggestions={message.suggestions} onSelect={onFollowUp} />
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ChatMessageBubble;
