import React, { useState } from 'react';
import { Bookmark, Download, ChevronDown, FileJson, FileText, Printer } from 'lucide-react';
import { exportAsMarkdown, exportAsJSON, exportAsPDF } from '../../utils/exportConversation';
import styles from './ChatHeader.module.css';

const ChatHeader = ({ conversation, messages, onToggleBookmark }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    if (!conversation) return null;

    const runExport = (format) => {
        setMenuOpen(false);
        if (format === 'md') exportAsMarkdown(conversation, messages);
        else if (format === 'json') exportAsJSON(conversation, messages);
        else if (format === 'pdf') exportAsPDF();
    };

    return (
        <div className={styles.header}>
            <div className={styles.titleWrap}>
                <span className={styles.title}>{conversation.title}</span>
                {conversation.isArchived && <span className={styles.badge}>Archived</span>}
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={`${styles.iconBtn} ${conversation.isBookmarked ? styles.active : ''}`}
                    onClick={() => onToggleBookmark(conversation.id, !conversation.isBookmarked)}
                    title="Bookmark conversation"
                >
                    <Bookmark size={15} fill={conversation.isBookmarked ? 'currentColor' : 'none'} />
                </button>

                <div className={styles.exportWrap}>
                    <button type="button" className={styles.exportBtn} onClick={() => setMenuOpen((v) => !v)}>
                        <Download size={14} /> Export <ChevronDown size={12} />
                    </button>
                    {menuOpen && (
                        <div className={styles.menu} onMouseLeave={() => setMenuOpen(false)}>
                            <button type="button" onClick={() => runExport('md')}><FileText size={13} /> Markdown</button>
                            <button type="button" onClick={() => runExport('json')}><FileJson size={13} /> JSON</button>
                            <button type="button" onClick={() => runExport('pdf')}><Printer size={13} /> PDF (print)</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;
