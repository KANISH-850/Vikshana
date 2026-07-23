import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useConversation } from '../hooks/useConversation';
import { useStreamingChat } from '../hooks/useStreamingChat';
import { useAppContext } from './AppContext';

const ConversationContext = createContext(null);

/** Thin provider composing useConversation (persistence/history) + useStreamingChat (live send), so sidebar/chat/input share one source of truth without prop drilling. */
export const ConversationProvider = ({ caseId, children }) => {
    const { officer } = useAppContext();
    const officerId = officer?.id;

    const conversation = useConversation({ caseId, officerId });
    const { activeConversationId, appendMessage } = conversation;

    const onUserMessage = useCallback((msg) => appendMessage(msg), [appendMessage]);
    const onAssistantMessage = useCallback((msg) => appendMessage(msg), [appendMessage]);

    const streaming = useStreamingChat({
        conversationId: activeConversationId,
        officerId,
        caseId,
        onUserMessage,
        onAssistantMessage
    });

    const value = useMemo(
        () => ({ caseId, officerId, ...conversation, ...streaming }),
        [caseId, officerId, conversation, streaming]
    );

    return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>;
};

export const useConversationContext = () => {
    const ctx = useContext(ConversationContext);
    if (!ctx) throw new Error('useConversationContext must be used within a ConversationProvider');
    return ctx;
};
