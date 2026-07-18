import { useCallback, useEffect, useState } from 'react';
import * as conversationService from '../services/conversationService';

/** Owns the conversation list + active conversation's message array for a given case. Streaming itself lives in useStreamingChat.js. */
export function useConversation({ caseId, officerId }) {
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const refreshConversations = useCallback(async () => {
        if (!caseId || !officerId) return [];
        const list = await conversationService.listConversations(caseId, officerId);
        setConversations(list);
        return list;
    }, [caseId, officerId]);

    const selectConversation = useCallback(async (id) => {
        setActiveConversationId(id);
        setLoading(true);
        try {
            const convo = await conversationService.getConversation(id);
            setMessages((convo && convo.messages) || []);
        } finally {
            setLoading(false);
        }
    }, []);

    const startNewConversation = useCallback(async () => {
        const convo = await conversationService.createConversation(caseId, officerId);
        setConversations((prev) => [convo, ...prev]);
        setActiveConversationId(convo.id);
        setMessages([]);
        return convo;
    }, [caseId, officerId]);

    const renameConversation = useCallback(async (id, title) => {
        const updated = await conversationService.updateConversation(id, { title });
        setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }, []);

    const toggleBookmark = useCallback(async (id, isBookmarked) => {
        const updated = await conversationService.updateConversation(id, { isBookmarked });
        setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }, []);

    const archiveConversation = useCallback(async (id, isArchived = true) => {
        const updated = await conversationService.updateConversation(id, { isArchived });
        setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }, []);

    const removeConversation = useCallback(async (id) => {
        await conversationService.deleteConversation(id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        setActiveConversationId((current) => {
            if (current === id) {
                setMessages([]);
                return null;
            }
            return current;
        });
    }, []);

    const appendMessage = useCallback((message) => {
        setMessages((prev) => [...prev, message]);
    }, []);

    useEffect(() => {
        setActiveConversationId(null);
        setMessages([]);
        refreshConversations();
    }, [refreshConversations]);

    return {
        conversations,
        activeConversationId,
        messages,
        loading,
        refreshConversations,
        selectConversation,
        startNewConversation,
        renameConversation,
        toggleBookmark,
        archiveConversation,
        removeConversation,
        appendMessage,
        setMessages
    };
}
