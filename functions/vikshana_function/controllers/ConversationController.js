const ConversationService = require('../services/ConversationService');
const ContextBuilderService = require('../services/ContextBuilderService');
const RetrievalService = require('../services/RetrievalService');
const SuggestionService = require('../services/SuggestionService');
const MemoryService = require('../services/MemoryService');
const glmClient = require('../services/glmClient');
const glmStreamClient = require('../services/glmStreamClient');
const { buildSystemPrompt } = require('../prompts/investigationChatPrompt');
const { extractCitations, enrichCitations } = require('../utils/citationParser');

const MAX_TOKENS = 1536;

class ConversationController {
    static async list(req, res) {
        try {
            const { caseId, officerId } = req.query;
            if (!caseId || !officerId) {
                return res.status(400).json({ success: false, error: 'caseId and officerId are required' });
            }
            const conversations = await ConversationService.listConversations(req, { caseId, officerId });
            res.status(200).json({ success: true, data: conversations });
        } catch (error) {
            console.error('Error in ConversationController.list:', error);
            res.status(500).json({ success: false, error: 'Failed to list conversations' });
        }
    }

    static async create(req, res) {
        try {
            const { caseId, officerId, title } = req.body;
            if (!caseId || !officerId) {
                return res.status(400).json({ success: false, error: 'caseId and officerId are required' });
            }
            const conversation = await ConversationService.createConversation(req, { caseId, officerId, title });
            res.status(201).json({ success: true, data: conversation });
        } catch (error) {
            console.error('Error in ConversationController.create:', error);
            res.status(500).json({ success: false, error: 'Failed to create conversation' });
        }
    }

    static async getOne(req, res) {
        try {
            const conversation = await ConversationService.getConversation(req, req.params.id);
            if (!conversation) {
                return res.status(200).json({
                    success: true,
                    data: {
                        id: req.params.id,
                        caseId: '1',
                        officerId: 'IND-POL-8802',
                        title: 'New Investigation Chat',
                        messages: []
                    }
                });
            }
            res.status(200).json({ success: true, data: conversation });
        } catch (error) {
            console.error('Error in ConversationController.getOne:', error);
            res.status(500).json({ success: false, error: 'Failed to load conversation' });
        }
    }

    static async update(req, res) {
        try {
            const { title, isBookmarked, isArchived } = req.body;
            const conversation = await ConversationService.updateConversation(req, req.params.id, { title, isBookmarked, isArchived });
            res.status(200).json({ success: true, data: conversation });
        } catch (error) {
            console.error('Error in ConversationController.update:', error);
            res.status(500).json({ success: false, error: 'Failed to update conversation' });
        }
    }

    static async remove(req, res) {
        try {
            await ConversationService.deleteConversation(req, req.params.id);
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error in ConversationController.remove:', error);
            res.status(500).json({ success: false, error: 'Failed to delete conversation' });
        }
    }

    /**
     * Core endpoint. `?stream=false` returns a plain JSON response (used for
     * quick verification and as the initial frontend integration target);
     * by default it streams the answer over SSE (see glmStreamClient.js).
     */
    static async sendMessage(req, res) {
        const conversationId = req.params.id;
        const { content, officerId } = req.body;
        const streaming = req.query.stream !== 'false';

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, error: 'content is required' });
        }

        try {
            let conversation = await ConversationService.getConversation(req, conversationId);
            if (!conversation) {
                console.log(`[ConversationController] Conversation ${conversationId} not found, auto-creating for case...`);
                const targetCaseId = req.body.caseId || '1';
                const targetOfficerId = officerId || 'IND-POL-8802';
                conversation = await ConversationService.createConversation(req, {
                    caseId: targetCaseId,
                    officerId: targetOfficerId,
                    title: 'New Investigation Chat'
                });
                // Ensure messages array is initialized
                conversation.messages = [];
            }

            const userMessage = await ConversationService.appendMessage(req, conversation.id || conversationId, { role: 'user', content });

            const priorUserTurns = conversation.messages.filter((m) => m.role === 'user').length;
            if (priorUserTurns === 0) {
                await ConversationService.maybeAutoTitle(req, conversation, content);
            }

            // Build context first (reflects all *prior* corrections), then let this
            // message itself register a new correction/pin, and rebuild if it did —
            // so "Ignore witness A" is already honored in this very response.
            let context = await ContextBuilderService.buildCaseContext(req, conversation.caseId);
            const correction = await MemoryService.recordIfCorrection(req, {
                caseId: conversation.caseId,
                officerId: officerId || conversation.officerId,
                message: content,
                context
            });
            if (correction) {
                context = await ContextBuilderService.buildCaseContext(req, conversation.caseId);
            }

            const retrieved = await RetrievalService.retrieve(req, { caseId: conversation.caseId, query: content, context });
            const systemPrompt = buildSystemPrompt({ context, retrieved });

            const { recentMessages } = ContextBuilderService.buildConversationWindow(
                conversation.messages.concat([userMessage])
            );
            const glmMessages = [
                { role: 'system', content: systemPrompt },
                ...recentMessages.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
            ];

            let assistantText;
            if (streaming) {
                glmStreamClient.initSSE(res);
                assistantText = await glmStreamClient.streamCompletion(res, glmMessages, { maxTokens: MAX_TOKENS });
            } else {
                const result = await glmClient.generate(glmMessages, { maxTokens: MAX_TOKENS });
                assistantText = result.content;
            }

            const citations = enrichCitations(extractCitations(assistantText), retrieved);
            const contextSummary = `Case #${conversation.caseId}, evidence on file: ${JSON.stringify(context.evidenceCounts)}`;
            const suggestions = await SuggestionService.generateFollowUps(assistantText, contextSummary);

            const assistantMessage = await ConversationService.appendMessage(req, conversationId, {
                role: 'assistant',
                content: assistantText,
                citations,
                suggestions
            });

            if (streaming) {
                glmStreamClient.sendEvent(res, 'citations', { citations });
                glmStreamClient.sendEvent(res, 'suggestions', { suggestions });
                glmStreamClient.sendEvent(res, 'done', { messageId: assistantMessage.id, userMessageId: userMessage.id });
                glmStreamClient.endStream(res);
            } else {
                res.status(200).json({ success: true, data: { userMessage, assistantMessage } });
            }
        } catch (error) {
            console.error('Error in ConversationController.sendMessage:', error);
            if (streaming) {
                if (!res.headersSent) {
                    res.status(500).json({ success: false, error: 'AI Processing Error' });
                } else {
                    try {
                        glmStreamClient.sendEvent(res, 'error', { message: 'AI Processing Error' });
                    } finally {
                        glmStreamClient.endStream(res);
                    }
                }
            } else if (!res.headersSent) {
                res.status(500).json({ success: false, error: 'AI Processing Error' });
            }
        }
    }
}

module.exports = ConversationController;
