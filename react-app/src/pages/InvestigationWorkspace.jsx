import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ConversationProvider, useConversationContext } from '../context/ConversationContext';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatHeader from '../components/chat/ChatHeader';
import ChatMessageList from '../components/chat/ChatMessageList';
import ChatInput from '../components/chat/ChatInput';
import ContextPanel from '../components/chat/ContextPanel';
import EvidenceModal from '../components/chat/EvidenceModal';
import { resolveSlashCommand, SLASH_COMMANDS } from '../utils/slashCommands';
import * as conversationService from '../services/conversationService';
import { exportAsMarkdown } from '../utils/exportConversation';
import DecisionSupportPanel from '../components/investigation/DecisionSupportPanel';
import styles from './InvestigationWorkspace.module.css';

const HELP_TEXT = `**Available commands**\n\n${SLASH_COMMANDS.map((c) => `- \`${c.command}\` — ${c.description}`).join('\n')}`;

const InvestigationChat = ({ caseId }) => {
    const {
        conversations,
        activeConversationId,
        messages,
        loading,
        selectConversation,
        startNewConversation,
        renameConversation,
        toggleBookmark,
        archiveConversation,
        removeConversation,
        appendMessage,
        send,
        stopGeneration,
        regenerate,
        isStreaming,
        streamedText,
        error
    } = useConversationContext();

    const [contextCollapsed, setContextCollapsed] = useState(false);
    const [contextRefreshKey, setContextRefreshKey] = useState(0);
    const [evidenceModal, setEvidenceModal] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Auto-restore the most recent conversation for this case on load.
    useEffect(() => {
        if (!activeConversationId && conversations.length > 0) {
            selectConversation(conversations[0].id);
        }
    }, [conversations, activeConversationId, selectConversation]);

    // Evidence counts / investigator memory can change after every turn — keep the context panel fresh.
    useEffect(() => {
        setContextRefreshKey((k) => k + 1);
    }, [messages.length]);

    const ensureConversation = useCallback(async () => {
        if (activeConversationId) return activeConversationId;
        const convo = await startNewConversation();
        return convo.id;
    }, [activeConversationId, startNewConversation]);

    const handleSend = useCallback(
        async (text) => {
            const conversationId = await ensureConversation();
            send(text, conversationId);
        },
        [ensureConversation, send]
    );

    const executeResolved = useCallback(
        async (resolved) => {
            if (resolved.type === 'chat') {
                handleSend(resolved.prompt);
                return;
            }

            const conversationId = await ensureConversation();

            if (resolved.action === 'help') {
                appendMessage({ id: `local-${Date.now()}`, role: 'assistant', content: HELP_TEXT, citations: [], suggestions: [] });
            } else if (resolved.action === 'reset') {
                await archiveConversation(conversationId, true);
                await startNewConversation();
            } else if (resolved.action === 'export') {
                const convo = conversations.find((c) => c.id === conversationId) || { title: 'Investigation Chat', caseId };
                exportAsMarkdown(convo, messages);
            } else if (resolved.action === 'report') {
                appendMessage({ id: `local-${Date.now()}`, role: 'assistant', content: '_Generating a court-ready report..._', citations: [], suggestions: [] });
                try {
                    const result = await conversationService.generateCaseReport(caseId);
                    appendMessage({ id: `local-${Date.now() + 1}`, role: 'assistant', content: result.markdown, citations: [], suggestions: [] });
                } catch (err) {
                    console.error('Report generation failed', err);
                    appendMessage({ id: `local-${Date.now() + 2}`, role: 'assistant', content: 'Report generation failed. Please try again.', citations: [], suggestions: [] });
                }
            }
        },
        [handleSend, ensureConversation, appendMessage, archiveConversation, startNewConversation, conversations, caseId, messages]
    );

    const handleRawSend = useCallback(
        (text) => {
            const resolved = resolveSlashCommand(text);
            if (!resolved) {
                handleSend(text);
                return;
            }
            executeResolved(resolved);
        },
        [handleSend, executeResolved]
    );

    const runQuickAction = useCallback(
        (qa) => {
            if (qa.command) {
                const resolved = resolveSlashCommand(qa.command);
                if (resolved) executeResolved(resolved);
            } else if (qa.prompt) {
                handleSend(qa.prompt);
            }
        },
        [executeResolved, handleSend]
    );

    const handleFilesSelected = useCallback(
        async (files) => {
            const conversationId = await ensureConversation();
            setUploading(true);
            try {
                // eslint-disable-next-line no-restricted-syntax
                for (const file of files) {
                    // eslint-disable-next-line no-await-in-loop
                    await conversationService.uploadAttachment(conversationId, caseId, file);
                }
                handleSend(
                    `I've uploaded ${files.length === 1 ? `"${files[0].name}"` : `${files.length} files`}. Please review and summarize the key investigative insights from it.`
                );
            } catch (err) {
                console.error('Upload failed', err);
                appendMessage({ id: `local-${Date.now()}`, role: 'assistant', content: 'The file upload failed. Please try again.', citations: [], suggestions: [] });
            } finally {
                setUploading(false);
            }
        },
        [ensureConversation, caseId, handleSend, appendMessage]
    );

    return (
        <div className={styles.page}>
            <div data-vik-no-print>
                <ChatSidebar
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    onSelect={selectConversation}
                    onNew={startNewConversation}
                    onRename={renameConversation}
                    onToggleBookmark={toggleBookmark}
                    onArchive={archiveConversation}
                    onDelete={removeConversation}
                />
            </div>

            <div className={styles.center} data-vik-print-area>
                <div data-vik-no-print>
                    <ChatHeader
                        conversation={conversations.find((c) => c.id === activeConversationId)}
                        messages={messages}
                        onRename={renameConversation}
                        onDelete={removeConversation}
                        onToggleBookmark={toggleBookmark}
                    />
                </div>
                <div className={styles.messages}>
                    <ChatMessageList
                        messages={messages}
                        isStreaming={isStreaming}
                        streamedText={streamedText}
                        onOpenEvidence={setEvidenceModal}
                        onFollowUp={handleSend}
                        onRegenerate={regenerate}
                    />
                </div>

                {error && <div className={styles.errorBanner} data-vik-no-print>{error}</div>}
                {uploading && <div className={styles.uploadBanner} data-vik-no-print>Uploading &amp; analyzing files...</div>}

                <div data-vik-no-print>
                    <ChatInput
                        onSend={handleRawSend}
                        onRunQuickAction={runQuickAction}
                        onFilesSelected={handleFilesSelected}
                        isStreaming={isStreaming}
                        onStop={stopGeneration}
                        disabled={loading || uploading}
                    />
                </div>

                {/* Investigator Decision Support Module */}
                <div style={{ marginTop: '16px' }} data-vik-no-print>
                    <DecisionSupportPanel caseId={caseId} />
                </div>
            </div>

            <div data-vik-no-print>
                <ContextPanel
                    caseId={caseId}
                    collapsed={contextCollapsed}
                    onToggle={() => setContextCollapsed((v) => !v)}
                    refreshKey={contextRefreshKey}
                />
            </div>

            <EvidenceModal citation={evidenceModal} onClose={() => setEvidenceModal(null)} />
        </div>
    );
};

const InvestigationWorkspace = () => {
    const { caseId } = useParams();
    const resolvedCaseId = caseId || '1';

    return (
        <ConversationProvider caseId={resolvedCaseId}>
            <InvestigationChat caseId={resolvedCaseId} />
        </ConversationProvider>
    );
};

export default InvestigationWorkspace;
