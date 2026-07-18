import React, { useMemo, useState } from 'react';
import { Plus, Search, Bookmark, Archive, Trash2, Pencil, MessageSquare } from 'lucide-react';
import styles from './ChatSidebar.module.css';

const ChatSidebar = ({ conversations, activeConversationId, onSelect, onNew, onRename, onToggleBookmark, onArchive, onDelete }) => {
    const [query, setQuery] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');

    const filtered = useMemo(
        () =>
            conversations
                .filter((c) => (showArchived ? c.isArchived : !c.isArchived))
                .filter((c) => (showBookmarkedOnly ? c.isBookmarked : true))
                .filter((c) => c.title.toLowerCase().includes(query.toLowerCase())),
        [conversations, showArchived, showBookmarkedOnly, query]
    );

    const commitRename = (id) => {
        if (editTitle.trim()) onRename(id, editTitle.trim());
        setEditingId(null);
    };

    return (
        <aside className={styles.sidebar}>
            <button type="button" className={styles.newBtn} onClick={onNew}>
                <Plus size={16} /> New Investigation Chat
            </button>

            <div className={styles.searchBox}>
                <Search size={14} />
                <input placeholder="Search conversations..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>

            <div className={styles.filters}>
                <button
                    type="button"
                    className={`${styles.filterBtn} ${showBookmarkedOnly ? styles.filterActive : ''}`}
                    onClick={() => setShowBookmarkedOnly((v) => !v)}
                >
                    <Bookmark size={13} /> Bookmarked
                </button>
                <button
                    type="button"
                    className={`${styles.filterBtn} ${showArchived ? styles.filterActive : ''}`}
                    onClick={() => setShowArchived((v) => !v)}
                >
                    <Archive size={13} /> Archived
                </button>
            </div>

            <div className={styles.list}>
                {filtered.length === 0 && <div className={styles.emptyHint}>No conversations yet.</div>}
                {filtered.map((c) => (
                    <div
                        key={c.id}
                        className={`${styles.item} ${c.id === activeConversationId ? styles.itemActive : ''}`}
                        onClick={() => onSelect(c.id)}
                    >
                        <MessageSquare size={14} className={styles.itemIcon} />
                        {editingId === c.id ? (
                            <input
                                autoFocus
                                className={styles.renameInput}
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.key === 'Enter' && commitRename(c.id)}
                                onBlur={() => commitRename(c.id)}
                            />
                        ) : (
                            <span className={styles.itemTitle}>{c.title}</span>
                        )}

                        <div className={styles.itemActions} onClick={(e) => e.stopPropagation()}>
                            <button
                                type="button"
                                title="Rename"
                                onClick={() => {
                                    setEditingId(c.id);
                                    setEditTitle(c.title);
                                }}
                            >
                                <Pencil size={12} />
                            </button>
                            <button type="button" title="Bookmark" onClick={() => onToggleBookmark(c.id, !c.isBookmarked)}>
                                <Bookmark size={12} fill={c.isBookmarked ? 'currentColor' : 'none'} />
                            </button>
                            <button
                                type="button"
                                title={c.isArchived ? 'Unarchive' : 'Archive'}
                                onClick={() => onArchive(c.id, !c.isArchived)}
                            >
                                <Archive size={12} />
                            </button>
                            <button type="button" title="Delete" onClick={() => onDelete(c.id)}>
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default ChatSidebar;
