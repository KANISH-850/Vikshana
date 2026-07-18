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

const ChatMessageBubble = ({ message, onOpenEvidence, onFollowUp, onRegenerate, isLast, streaming }) => {
    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const isUser = message.role === 'user';

    const processedContent = useMemo(() => injectEvidenceLinks(message.content || ''), [message.content]);

    function LinkRenderer({ href, children }) {
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
                ) : streaming ? (
                    // Raw text while streaming — partial markdown (an unclosed table/code fence mid-stream)
                    // renders unpredictably, so we swap to full ReactMarkdown once the message finalizes.
                    <div className={styles.streamingText}>
                        {message.content}
                        <span className="vik-streaming-cursor" />
                    </div>
                ) : (
                    <div className="vik-markdown">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                            components={{ code: CodeBlock, a: LinkRenderer }}
                        >
                            {processedContent}
                        </ReactMarkdown>
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
