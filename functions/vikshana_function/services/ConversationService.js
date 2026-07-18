const datastoreClient = require('../queries/datastoreClient');

const DEFAULT_TITLE = 'New Investigation Chat';

function toMessageDTO(row) {
    return {
        id: row.ROWID,
        conversationId: row.conversation_id,
        role: row.role,
        content: row.content,
        citations: safeParse(row.citations, []),
        attachmentIds: safeParse(row.attachment_ids, []),
        suggestions: safeParse(row.suggestions, []),
        tokenUsage: safeParse(row.token_usage, null),
        createdAt: row.CREATEDTIME
    };
}

function toConversationDTO(row) {
    return {
        id: row.ROWID,
        caseId: row.case_id,
        officerId: row.officer_id,
        title: row.title || DEFAULT_TITLE,
        isBookmarked: row.is_bookmarked === true || row.is_bookmarked === 'true',
        isArchived: row.is_archived === true || row.is_archived === 'true',
        lastMessageAt: row.last_message_at || row.CREATEDTIME,
        createdAt: row.CREATEDTIME
    };
}

function safeParse(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

class ConversationService {
    static async listConversations(req, { caseId, officerId }) {
        const rows = await datastoreClient.getRowsWhere(
            req,
            'Conversation',
            { case_id: caseId, officer_id: officerId },
            { maxRows: 100, orderBy: 'last_message_at' }
        );
        return rows.map(toConversationDTO);
    }

    static async createConversation(req, { caseId, officerId, title }) {
        const row = await datastoreClient.insertRow(req, 'Conversation', {
            case_id: caseId,
            officer_id: officerId,
            title: title || DEFAULT_TITLE,
            is_bookmarked: false,
            is_archived: false,
            last_message_at: new Date().toISOString()
        });
        return toConversationDTO(row);
    }

    static async getConversation(req, id) {
        const row = await datastoreClient.getRowById(req, 'Conversation', id);
        if (!row) return null;
        const messageRows = await datastoreClient.getRowsWhere(
            req,
            'Message',
            { conversation_id: id },
            { maxRows: 500, orderBy: 'CREATEDTIME', order: 'ASC' }
        );
        return {
            ...toConversationDTO(row),
            messages: messageRows.map(toMessageDTO)
        };
    }

    static async updateConversation(req, id, { title, isBookmarked, isArchived }) {
        const patch = {};
        if (title !== undefined) patch.title = title;
        if (isBookmarked !== undefined) patch.is_bookmarked = !!isBookmarked;
        if (isArchived !== undefined) patch.is_archived = !!isArchived;
        const row = await datastoreClient.updateRow(req, 'Conversation', id, patch);
        return toConversationDTO(row);
    }

    static async deleteConversation(req, id) {
        const messageRows = await datastoreClient.getRowsWhere(req, 'Message', { conversation_id: id }, { maxRows: 500 });
        await Promise.all(messageRows.map((m) => datastoreClient.deleteRow(req, 'Message', m.ROWID)));
        return datastoreClient.deleteRow(req, 'Conversation', id);
    }

    static async appendMessage(req, conversationId, { role, content, citations = [], attachmentIds = [], suggestions = [], tokenUsage = null }) {
        const row = await datastoreClient.insertRow(req, 'Message', {
            conversation_id: conversationId,
            role,
            content,
            citations: JSON.stringify(citations),
            attachment_ids: JSON.stringify(attachmentIds),
            suggestions: JSON.stringify(suggestions),
            token_usage: tokenUsage ? JSON.stringify(tokenUsage) : ''
        });

        await datastoreClient.updateRow(req, 'Conversation', conversationId, {
            last_message_at: new Date().toISOString()
        });

        return toMessageDTO(row);
    }

    /** First user message on a still-untitled conversation becomes its title, ChatGPT-style. */
    static async maybeAutoTitle(req, conversation, firstUserMessageContent) {
        if (conversation.title && conversation.title !== DEFAULT_TITLE) return conversation;
        const title = String(firstUserMessageContent || '').slice(0, 60).trim() || DEFAULT_TITLE;
        return ConversationService.updateConversation(req, conversation.id, { title });
    }
}

module.exports = ConversationService;
